'use strict';
const projectModel = require('../models/project.model');
const userModel = require('../models/user.model');
const { recommendCollaborators, recommendProjects } = require('../services/ml.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Creates a new project and sets the caller as owner.
 */
exports.create = (req, res, next) => {
  try {
    const { title, description, requiredSkills, maxTeamSize } = req.body;
    
    const project = projectModel.createProject({
      userId: req.user.id,
      title,
      description,
      requiredSkills,
      maxTeamSize
    });

    return successResponse(res, project, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Lists projects.
 */
exports.list = (req, res, next) => {
  try {
    const { status, skill, page = 1, limit = 10 } = req.query;

    const filters = { status, skill };

    const { projects, total } = projectModel.listProjects(
      filters,
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    const meta = {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, projects, 200, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a specific project by ID.
 */
exports.getById = (req, res, next) => {
  try {
    const { id } = req.params;
    
    const project = projectModel.findById(id);
    if (!project) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Project not found');
    }

    const members = projectModel.getMembers(id);
    project.members = members;

    return successResponse(res, project);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a project.
 */
exports.update = (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!projectModel.isProjectOwner(id, req.user.id)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'Only project owners can update the project');
    }

    const { title, description, requiredSkills, maxTeamSize, status } = req.body;

    const updated = projectModel.updateProject(id, {
      title,
      description,
      requiredSkills,
      maxTeamSize,
      status
    });

    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a project.
 */
exports.delete = (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!projectModel.isProjectOwner(id, req.user.id)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'Only project owners can delete the project');
    }

    projectModel.deleteProject(id);
    return successResponse(res, { message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Recommends collaborators for a specific project via ML.
 * Direction: Project → Students
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!projectModel.isProjectOwner(id, req.user.id)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'Only project owners can get recommendations');
    }

    const project = projectModel.findById(id);
    if (!project) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Project not found');
    }

    const requiredSkills = Array.isArray(project.required_skills) ? project.required_skills : [];

    // Guard: no required skills defined on the project
    if (requiredSkills.length === 0) {
      return successResponse(res, [], 200, {
        message: 'Project has no required skills defined. Add skills to get recommendations.',
      });
    }

    // Fetch all users (limit 1000 for demo; production would page or pre-filter)
    const { users } = userModel.searchUsers({}, 1, 1000);

    // Format user skills — accept both list and plain string
    const formattedUserSkills = users.map(u => ({
      user_id: u.id,
      skills: Array.isArray(u.skills) ? u.skills : [],
    }));

    // Exclude every current member (any status) so they are not re-recommended
    const members = projectModel.getMembers(id);
    const excludeIds = new Set(members.map(m => m.user_id));

    const mlRecommendations = await recommendCollaborators(
      requiredSkills,
      formattedUserSkills,
      excludeIds,
      10,
    );

    // Re-hydrate ML results with full user profiles
    const userMap = new Map(users.map(u => [u.id, u]));
    const populatedRecommendations = mlRecommendations
      .map(rec => ({
        score: rec.score,
        user: userMap.get(rec.user_id) || null,
      }))
      .filter(r => r.user !== null);

    return successResponse(res, populatedRecommendations);
  } catch (error) {
    next(error);
  }
};

/**
 * Recommends open projects for the authenticated student via ML.
 * Direction: Student → Projects
 */
exports.getRecommendedProjects = async (req, res, next) => {
  try {
    // Allow fetching recommendations for any user, but only the user themselves
    // or an admin should normally hit this. For now, anyone authenticated can query.
    const targetUserId = parseInt(req.params.id, 10);

    const user = userModel.findById(targetUserId);
    if (!user) {
      return errorResponse(res, 404, 'NOT_FOUND', 'User not found');
    }

    const studentSkills = Array.isArray(user.skills) ? user.skills : [];

    // Guard: student has no skills on their profile
    if (studentSkills.length === 0) {
      return successResponse(res, [], 200, {
        message: 'No skills found on your profile. Add skills to get project recommendations.',
      });
    }

    // Fetch open projects (up to 500 for matching)
    const { projects } = projectModel.listProjects({ status: 'open' }, 1, 500);

    if (!projects || projects.length === 0) {
      return successResponse(res, [], 200, { message: 'No open projects available.' });
    }

    // Build exclude list: projects the user owns or is already a member of
    const excludeProjectIds = new Set(
      projects
        .filter(p => {
          const members = projectModel.getMembers(p.id);
          return members.some(m => m.user_id === targetUserId);
        })
        .map(p => p.id)
    );

    // Format projects for ML payload
    const projectPayload = projects
      .filter(p => !excludeProjectIds.has(p.id))
      .map(p => ({
        project_id: p.id,
        required_skills: Array.isArray(p.required_skills) ? p.required_skills : [],
      }));

    if (projectPayload.length === 0) {
      return successResponse(res, [], 200, { message: 'No eligible projects to match.' });
    }

    const mlRecommendations = await recommendProjects(
      studentSkills,
      projectPayload,
      [],   // already filtered above
      10,
    );

    // Re-hydrate ML results with full project objects
    const projectMap = new Map(projects.map(p => [p.id, p]));
    const populatedRecommendations = mlRecommendations
      .map(rec => ({
        score: rec.score,
        project: projectMap.get(rec.project_id) || null,
      }))
      .filter(r => r.project !== null);

    return successResponse(res, populatedRecommendations);
  } catch (error) {
    next(error);
  }
};

/**
 * Requests to join a project.
 */
exports.requestJoin = (req, res, next) => {
  try {
    const { id } = req.params;
    
    const project = projectModel.findById(id);
    if (!project) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Project not found');
    }

    if (project.status !== 'open') {
      return errorResponse(res, 400, 'BAD_REQUEST', 'Project is not open for new members');
    }

    if (project.current_team_size >= project.max_team_size) {
      return errorResponse(res, 400, 'BAD_REQUEST', 'Project team is full');
    }

    try {
      projectModel.addMember(id, req.user.id, 'member', 'pending');
      
      const requester = require('../models/user.model').findById(req.user.id);
      const ownerDocs = projectModel.getMembers(id).filter(m => m.role === 'owner');
      
      if (ownerDocs.length > 0) {
        require('../models/notification.model').createNotification({
          userId: ownerDocs[0].user_id,
          type: 'collab_request',
          message: `${requester.name} requested to join ${project.title}.`,
          referenceId: id,
          referenceType: 'project'
        });
      }
    } catch (err) {
      return errorResponse(res, 400, 'BAD_REQUEST', err.message);
    }

    return successResponse(res, { message: 'Join request sent successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Accepts or rejects a join request.
 */
exports.handleMember = (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    
    if (!projectModel.isProjectOwner(id, req.user.id)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'Only project owners can manage members');
    }

    if (!['accept', 'reject'].includes(action)) {
      return errorResponse(res, 400, 'BAD_REQUEST', "Action must be 'accept' or 'reject'");
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    const info = projectModel.updateMemberStatus(id, userId, newStatus, 'member');
    
    if (info.changes === 0) {
       return errorResponse(res, 404, 'NOT_FOUND', 'Member request not found');
    }

    const project = projectModel.findById(id);
    const owner = require('../models/user.model').findById(req.user.id);
    
    require('../models/notification.model').createNotification({
      userId: userId,
      type: newStatus === 'accepted' ? 'collab_accepted' : 'collab_rejected',
      message: `${owner.name} ${newStatus} your request to join ${project.title}.`,
      referenceId: id,
      referenceType: 'project'
    });

    return successResponse(res, { message: `Member request ${newStatus}` });
  } catch (error) {
    next(error);
  }
};

'use strict';
const config = require('../config/config');

/**
 * Centralised helper to log ML degradation in a structured way.
 * This makes it easy for ops to grep for ML failures.
 */
function logMlDegradation(source, error, extra = {}) {
  const payload = {
    source,
    message: error.message,
    mlServiceUrl: config.ML_SERVICE_URL,
    ...extra,
  };
  console.warn('[ML_DEGRADE]', JSON.stringify(payload));
}

/**
 * Validates achievements content via the Python Machine Learning service.
 * @param {string} title 
 * @param {string} description 
 * @returns {Promise<{category: string, confidence: number}|null>}
 */
async function classifyAchievement(title, description) {
  try {
    const text = `${title}. ${description}`;

    // Add 5 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const startedAt = Date.now();

    const response = await fetch(`${config.ML_SERVICE_URL}/classify-achievement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ML Service responded with ${response.status}`);
    }

    const data = await response.json();
    return {
      category: data.category,
      confidence: data.confidence,
      latencyMs: Date.now() - startedAt
    };
  } catch (error) {
    logMlDegradation('classifyAchievement', error);
    return null; // Graceful fallback
  }
}

/**
 * Recommends collaborators for a specific project.
 * @param {Array<string>} requiredSkills 
 * @param {Array<{user_id: number, skills: string}>} userSkills 
 * @param {Array<number>} excludeUserIds 
 * @param {number} topN 
 * @returns {Promise<Array<{user_id: number, score: number}>|null>}
 */
async function recommendCollaborators(requiredSkills, userSkills, excludeUserIds = [], topN = 10) {
  try {
    // Add 5 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const startedAt = Date.now();

    const payload = {
      required_skills: requiredSkills,
      user_skills: userSkills,
      exclude_user_ids: excludeUserIds,
      top_n: topN
    };

    const response = await fetch(`${config.ML_SERVICE_URL}/recommend-collaborators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ML Service responded with ${response.status}`);
    }

    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    logMlDegradation('recommendCollaborators', error, {
      requiredSkillsCount: Array.isArray(requiredSkills) ? requiredSkills.length : undefined,
      userSkillsCount: Array.isArray(userSkills) ? userSkills.length : undefined,
    });
    return []; // Graceful fallback
  }
}

/**
 * Recommends projects for a specific student based on their skills.
 * @param {string|Array<string>} studentSkills  — the student's skills (list or space-separated string)
 * @param {Array<{project_id: number, required_skills: string|Array<string>}>} projects — candidate projects
 * @param {Array<number>} excludeProjectIds     — project IDs to exclude (already joined/owned)
 * @param {number} topN                         — max results to return
 * @returns {Promise<Array<{project_id: number, score: number}>>}
 */
async function recommendProjects(studentSkills, projects, excludeProjectIds = [], topN = 10) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const startedAt = Date.now();

    const payload = {
      student_skills: studentSkills,
      projects: projects,
      exclude_project_ids: excludeProjectIds,
      top_n: topN,
    };

    const response = await fetch(`${config.ML_SERVICE_URL}/recommend-projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ML Service responded with ${response.status}`);
    }

    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    logMlDegradation('recommendProjects', error, {
      studentSkillsCount: Array.isArray(studentSkills) ? studentSkills.length : undefined,
      projectsCount: Array.isArray(projects) ? projects.length : undefined,
    });
    return []; // Graceful fallback — caller handles empty result
  }
}

module.exports = {
  classifyAchievement,
  recommendCollaborators,
  recommendProjects,
};

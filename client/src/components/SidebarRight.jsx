import { Link } from 'react-router-dom';

export default function SidebarRight() {
  const trending = [
    { id: 1, title: 'Quantum Computing Breakthrough', seekers: '1.2k seekers' },
    { id: 2, title: '#Hackathon2024 Winners', seekers: '850 seekers' },
    { id: 3, title: 'New Research on Climate Change', seekers: '2.1k seekers' },
    { id: 4, title: 'SKIL Hub: Phase 2 Launch', seekers: '500 seekers' },
  ];

  const suggestions = [
    { id: 1, name: 'Dr. Sarah Connor', role: 'Research Lead', avatar: null },
    { id: 2, name: 'James Maxwell', role: 'Student Developer', avatar: null },
  ];

  return (
    <aside className="sidebar-right">
      <div className="card">
        <h3 className="text-sm font-bold text-muted mb-4 flex justify-between items-center">
          SKIL Hub News
          <span className="text-xs font-normal text-primary cursor-pointer hover:underline">ℹ️</span>
        </h3>
        <ul className="flex flex-col gap-4">
          {trending.map((item) => (
            <li key={item.id} className="cursor-pointer group">
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                • {item.title}
              </p>
              <p className="text-xs text-muted ml-3">{item.seekers}</p>
            </li>
          ))}
        </ul>
        <button className="btn btn-ghost btn-sm w-full mt-4 text-muted font-bold">
          Show more ⌄
        </button>
      </div>

      <div className="card sidebar-sticky-box">
        <h3 className="text-sm font-bold text-muted mb-4">Add to your network</h3>
        <ul className="flex flex-col gap-4">
          {suggestions.map((person) => (
            <li key={person.id} className="flex gap-3">
              <div className="avatar avatar-md">
                {person.initials || person.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{person.name}</p>
                <p className="text-xs text-muted truncate">{person.role}</p>
                <button className="btn btn-secondary btn-sm mt-2 rounded-full border-primary text-primary font-bold hover:bg-primary-light">
                  + Follow
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center p-4">
        <p className="text-[10px] text-muted flex flex-wrap justify-center gap-x-3 gap-y-1">
          <span>About</span>
          <span>Accessibility</span>
          <span>Help Center</span>
          <span>Privacy & Terms</span>
          <br />
          <span className="font-bold text-primary mt-1">SKIL Hub © 2024</span>
        </p>
      </div>
    </aside>
  );
}

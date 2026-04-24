'use client';

interface Project {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
}

interface Props {
  projects: Project[];
  projectId: string;
  onChange?: (id: string) => void;
  simple?: boolean;
}

export default function ProjectSelector({ projects, projectId, onChange, simple }: Props) {
  if (simple) {
    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Current Project</h3>
        {projects.filter(p => p.id === projectId).map(p => (
          <div key={p.id} className="p-3 bg-blue-600/20 border border-blue-500/50 rounded-lg">
            <p className="text-sm font-bold text-white">{p.name}</p>
            <p className="text-xs text-slate-400">{p.description}</p>
            <p className="text-xs text-blue-400 mt-2">{p.itemCount} items</p>
          </div>
        ))}
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <select
      value={projectId}
      onChange={handleChange}
      className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 text-sm"
    >
      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}
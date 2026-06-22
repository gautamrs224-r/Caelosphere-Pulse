export default function SettingsSection({ title, children, className = "" }) {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 px-1">
          {title}
        </h3>
      )}
      <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

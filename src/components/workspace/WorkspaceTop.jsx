export default function WorkspaceTop({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="workspace__top">
      <div className="workspace__title">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {actions ? <div className="toolbar">{actions}</div> : null}
    </div>
  );
}

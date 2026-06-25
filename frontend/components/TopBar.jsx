export default function TopBar() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #f65601 0%, #f65601 100%)',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(246, 86, 1, 0.2)',
      }}
    />
  );
}

export function Button({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition ${className}`}
    />
  );
}
export function Checkbox({ id, name, checked, onCheckedChange }) {
  return (
    <input
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
    />
  );
}
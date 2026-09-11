export default function App() {
  const colors = ['blue', 'red', 'green']

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Dynamic Class Bug</h1>
      <div className="flex gap-4">
        {colors.map((color) => (
          <span
            key={color}
            className={`bg-${color}-600 text-white px-4 py-2 rounded`}
          >
            {color}
          </span>
        ))}
      </div>
    </div>
  )
}

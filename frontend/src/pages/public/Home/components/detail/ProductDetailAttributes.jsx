function groupAttributes(attributes = []) {
  const map = {};
  attributes.forEach((a) => {
    const name = a.attributeValue?.attribute?.name ?? "Otro";
    if (!map[name]) map[name] = [];
    map[name].push(a.attributeValue?.value ?? "—");
  });
  return map;
}

export default function ProductDetailAttributes({ attributes = [] }) {
  const groups = groupAttributes(attributes);
  if (!Object.keys(groups).length) return null;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-5">
      {Object.entries(groups).map(([name, values]) => (
        <div key={name}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-2.5">
            {name}
          </p>
          <div className="flex flex-wrap gap-2">
            {values.map((v) => (
              <span
                key={v}
                className="text-sm font-semibold px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

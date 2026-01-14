interface ResultCardProps {
  title: string;
  result: string | object;
}

export function ResultCard({ title, result }: ResultCardProps) {
  const displayResult = typeof result === 'string' 
    ? result 
    : JSON.stringify(result, null, 2);

  return (
    <div className="card animate-slide-up">
      <h3 className="text-xl font-bold text-primary-600 mb-4">{title}</h3>
      <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm text-gray-800 font-mono">{displayResult}</pre>
      </div>
    </div>
  );
}

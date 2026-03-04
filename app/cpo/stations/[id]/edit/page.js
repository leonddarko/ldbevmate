export default function EditStationPage({ params }) {
    console.log(params);
    
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Edit Station: {params.id}
      </h1>

      <p>Form goes here...</p>
    </div>
  );
}
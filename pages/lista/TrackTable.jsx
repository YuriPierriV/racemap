import React from "react";
import DropdownActions from "pages/lista/DropdownActions";

export default function TrackTable({
  listTrack,
  setDropdownOpen,
  dropdownOpen,
  viewTrack, // Renomeado
  deleteTrack, // Renomeado
  setIsEditing,
  setFormData,
}) {
  const startEdit = (trackId) => {
    // Renomeado
    const track = listTrack.find((t) => t.id === trackId); // Renomeado
    if (track) {
      setFormData({
        trackId: track.id, // Renomeado
        name: track.name,
        inner_track: track.inner_track,
        outer_track: track.outer_track,
        padding: track.padding,
        curveintensity: track.curveintensity,
        rotation: track.rotation,
      });
      setIsEditing(true);
      setDropdownOpen(null);
    }
  };

  return (
    <div className="w-full pr-4">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border-separate border-spacing-y-2">
        <tbody>
          {listTrack.map(
            (
              track, // Renomeado
            ) => (
              <tr className="bg-slate-800 rounded-lg shadow-md" key={track.id}>
                <td className="px-6 py-4 font-medium text-white">
                  {track.name}
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(track.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => viewTrack(track.id)} // Renomeado
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Visualizar
                  </button>
                </td>
                <td className="px-6 py-4">
                  <DropdownActions
                    trackId={track.id} // Renomeado
                    dropdownOpen={dropdownOpen}
                    setDropdownOpen={setDropdownOpen}
                    startEdit={startEdit}
                    deleteTrack={deleteTrack} // Renomeado
                    viewTrack={viewTrack} // Renomeado
                  />
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

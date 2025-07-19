"use client";
import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [upload, setUpload] = useState(null);
  const [data, setData] = useState(null);
  const [popUp, setPopUp] = useState(false);

  const handleDelete = (e) => {
    e.preventDefault();
    setFile(null);
    setImagePreview(null);
  };
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setImagePreview(imageUrl);
    }
  };
  const handleOpenItems = (e) => {
    e.preventDefault();
    if (data !== null) {
      setPopUp(true);
    }
  };
  console.log(popUp);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpload({ nome: file.name, status: 1 });
    if (!file) return alert("Selecione uma imagem primeiro.");

    const formData = new FormData();
    formData.append("image", file);
    setFile(null);
    setImagePreview(null);

    const res = await fetch("/api/gemini", {
      method: "POST",
      body: formData,
    });
    /*     const res = await fetch("/api/test", {
      method: "POST",
    }); */

    const data = await res.json();
    if (res.ok) {
      setUpload((prev) => ({ ...prev, status: 2 }));
      setData(data.result);
    } else {
      setUpload((prev) => ({ ...prev, status: 3 }));
      console.error(error);
    }
  };

  console.log(data);
  return (
    <div className="max-w-screen p-4 gap-4 flex flex-col">
      <form>
        <div className="col-span-full">
          <label
            htmlFor="cover-photo"
            className="block text-lg font-semibold text-white mb-2"
          >
            Upload da imagem
          </label>

          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            {imagePreview ? (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            ) : (
              <div className="text-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="mx-auto size-12 text-gray-300"
                >
                  <path
                    d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                </svg>
                <div className="mt-4 flex text-sm text-gray-500">
                  <label
                    htmlFor="file-upload"
                    className="px-3 py-1 cursor-pointer rounded-md bg-gray-300 font-semibold text-slate-800 hover:text-slate-600"
                  >
                    <span>Selecionar imagem</span>
                    <input
                      accept="image/*"
                      onChange={handleImageChange}
                      id="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-around">
          <button
            onClick={handleDelete}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </form>
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold">Status</p>
        {upload && (
          <div className="flex flex-row justify-around">
            <button onClick={handleOpenItems}>{upload?.nome}</button>
            {upload.status === 1 && (
              <div className="animate-spin flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </div>
            )}
            {upload.status === 2 && (
              <div className=" text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
            )}

            {upload.status === 3 && (
              <div className="text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
      {popUp && (
        <div className="absolute inset-0 shadow-lg flex flex-col items-end bg-gray-200 text-black w-max p-3 m-3 h-2/3 font-bold">
          <button
            className="bg-red-300 rounded "
            onClick={(e) => {
              setPopUp(false);
              e.preventDefault();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex flex-col w-full items-start gap-2">
            <p className="text-center w-full text-lg">{data.store_name}</p>
            {data.items.map((item) => (
              <div
                className="text-xs grid grid-cols-4 w-full border-b-1"
                key={item.name}
              >
                <p className="col-span-2">{item.name}</p>
                <p className="text-center">{item.quantity}</p>
                <p className="text-center">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

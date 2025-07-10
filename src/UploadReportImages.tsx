import React, { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase/config";
import { useNavigate } from "react-router-dom";

export default function UploadReportImages() {
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [palmImage, setPalmImage] = useState<string | null>(null);
  const [faceUploadProgress, setFaceUploadProgress] = useState<number>(0);
  const [palmUploadProgress, setPalmUploadProgress] = useState<number>(0);
  const [faceDownloadUrl, setFaceDownloadUrl] = useState<string | null>(null);
  const [palmDownloadUrl, setPalmDownloadUrl] = useState<string | null>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const palmInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaceImage(URL.createObjectURL(file));
      // Upload to Firebase Storage
      const storageRef = ref(storage, `face_uploads/${file.name}_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFaceUploadProgress(progress);
        },
        (error) => {
          alert("Face image upload failed: " + error.message);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFaceDownloadUrl(downloadURL);
          });
        }
      );
    }
  };

  const handlePalmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPalmImage(URL.createObjectURL(file));
      // Upload to Firebase Storage
      const storageRef = ref(storage, `palm_uploads/${file.name}_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setPalmUploadProgress(progress);
        },
        (error) => {
          alert("Palm image upload failed: " + error.message);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setPalmDownloadUrl(downloadURL);
          });
        }
      );
    }
  };

  const handleContinue = () => {
    if (faceDownloadUrl && palmDownloadUrl) {
      navigate('/face-palm-report', {
        state: {
          faceDownloadUrl,
          palmDownloadUrl
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 flex flex-col items-center">
      {/* Header */}
      <header className="flex justify-between items-center p-6 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900">AstroScan</span>
        </div>
      </header>
      {/* Hero Text */}
      <div className="text-center mt-4 mb-10 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Upload Your <span className="text-purple-600">Face</span> & <span className="text-purple-600">Palm</span> Images
        </h1>
        <p className="text-lg text-gray-600">
          For your personalized Palmistry & Face Report, please upload clear images below.
        </p>
      </div>
      {/* Upload Cards */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Face Upload */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center w-80">
          <h2 className="font-semibold text-lg text-gray-900 mb-2">Face Image</h2>
          <div className="w-40 h-40 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 overflow-hidden border-2 border-dashed border-purple-300">
            {faceImage ? (
              <img src={faceImage} alt="Face Preview" className="object-cover w-full h-full" />
            ) : (
              <span className="text-purple-400">No image</span>
            )}
          </div>
          {faceUploadProgress > 0 && faceUploadProgress < 100 && (
            <div className="w-full mb-2">
              <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${faceUploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-purple-600 mt-1">Uploading: {faceUploadProgress.toFixed(0)}%</p>
            </div>
          )}
          {faceDownloadUrl && (
            <p className="text-xs text-green-600 mb-2">Uploaded!</p>
          )}
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium mb-2"
            onClick={() => faceInputRef.current?.click()}
          >
            Upload Face
          </button>
          <input
            type="file"
            accept="image/*"
            ref={faceInputRef}
            className="hidden"
            onChange={handleFaceChange}
          />
        </div>
        {/* Palm Upload */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center w-80">
          <h2 className="font-semibold text-lg text-gray-900 mb-2">Palm Image</h2>
          <div className="w-40 h-40 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 overflow-hidden border-2 border-dashed border-purple-300">
            {palmImage ? (
              <img src={palmImage} alt="Palm Preview" className="object-cover w-full h-full" />
            ) : (
              <span className="text-purple-400">No image</span>
            )}
          </div>
          {palmUploadProgress > 0 && palmUploadProgress < 100 && (
            <div className="w-full mb-2">
              <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${palmUploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-purple-600 mt-1">Uploading: {palmUploadProgress.toFixed(0)}%</p>
            </div>
          )}
          {palmDownloadUrl && (
            <p className="text-xs text-green-600 mb-2">Uploaded!</p>
          )}
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium mb-2"
            onClick={() => palmInputRef.current?.click()}
          >
            Upload Palm
          </button>
          <input
            type="file"
            accept="image/*"
            ref={palmInputRef}
            className="hidden"
            onChange={handlePalmChange}
          />
        </div>
      </div>
      {/* Continue Button */}
      <button
        className="bg-black text-white hover:bg-gray-800 rounded-xl px-10 py-4 text-lg font-semibold shadow-lg mb-8"
        disabled={!faceDownloadUrl || !palmDownloadUrl}
        style={{ opacity: faceDownloadUrl && palmDownloadUrl ? 1 : 0.5 }}
        onClick={handleContinue}
      >
        Continue
      </button>
    </div>
  );
} 
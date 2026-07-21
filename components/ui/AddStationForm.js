"use client";

import { Plug, X, ImagePlus } from "lucide-react";
import { useState, useEffect } from "react";
// Import your Supabase client here (adjust the path to your setup)
import { supabase } from "@/lib/supabase"; // Path to your supabase config
import Toast from "./toast";

const CONNECTOR_OPTIONS = ["Type2", "CCS", "CHAdeMO", "GB/T", "Tesla"];
const MAX_IMAGES = 6;

export default function AddStationForm({ onSuccess }) {
    const [cpo, setCpo] = useState(null);
    const [loadingCPO, setLoadingCPO] = useState(true);
    
    // State for local image files and their preview blobs
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    useEffect(() => {
        async function fetchCPO() {
            const res = await fetch("/api/cpo/me");
            const data = await res.json();

            if (res.ok) {
                setCpo(data.cpo);
            }

            setLoadingCPO(false);
        }

        fetchCPO();
    }, []);

    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        latitude: "",
        longitude: "",
        connectors: [],
        powerKW: "",
        pricePerKWh: "",
        outlets: "",
        availabilityStatus: "available",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleConnectorChange = (connector) => {
        setForm((prev) => {
            const exists = prev.connectors.includes(connector);
            return {
                ...prev,
                connectors: exists
                    ? prev.connectors.filter((c) => c !== connector)
                    : [...prev.connectors, connector],
            };
        });
    };

    // Handle selecting local image files
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        
        if (imageFiles.length + files.length > MAX_IMAGES) {
            setToast({
                open: true,
                type: "warning",
                title: "Limit Exceeded",
                message: `You can only upload up to ${MAX_IMAGES} images.`,
            });
            return;
        }

        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    // Remove a selected image before upload
    const removeImage = (index) => {
        // Revoke blob URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviews[index]);
        
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Helper to upload all selected files to Supabase Bucket
    const uploadImagesToSupabase = async () => {
        const uploadedUrls = [];
        
        for (const file of imageFiles) {
            // Generate a distinct file path structure
            const fileExt = file.name.split('.').pop();
            const fileName = `${cpo?._id || 'station'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
            const filePath = `station-images/${fileName}`;

            // Make sure your bucket name matches your Supabase Storage configurations
            const { data, error } = await supabase.storage
                .from("stations") 
                .upload(filePath, file);

            if (error) throw error;

            // Retrieve public URL
            const { data: { publicUrl } } = supabase.storage
                .from("stations")
                .getPublicUrl(filePath);

            uploadedUrls.push(publicUrl);
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const lat = parseFloat(form.latitude);
            const lng = parseFloat(form.longitude);

            if (isNaN(lat) || lat < -90 || lat > 90) {
                setToast({
                    open: true,
                    type: "warning",
                    title: "Latitude error",
                    message: "Please enter a valid Latitude between -90 and 90. (e.g. 5.907320)",
                });
                setLoading(false);
                return;
            }
            if (isNaN(lng) || lng < -180 || lng > 180) {
                setToast({
                    open: true,
                    type: "warning",
                    title: "Longitude error",
                    message: "Please enter a valid Longitude between -180 and 180. (e.g. -0.299188)",
                });
                setLoading(false);
                return;
            }

            // 1. Upload images first if files are present
            let imageUrls = [];
            if (imageFiles.length > 0) {
                setUploadingImages(true);
                imageUrls = await uploadImagesToSupabase();
                setUploadingImages(false);
            }

            // 2. Build backend payload including the image URL strings
            const payload = {
                cpo: cpo._id,
                name: form.name,
                description: form.description,
                address: form.address,
                location: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                connectors: form.connectors,
                powerKW: Number(form.powerKW),
                pricePerKWh: form.pricePerKWh ? Number(form.pricePerKWh) : undefined,
                outlets: form.outlets,
                availabilityStatus: form.availabilityStatus,
                images: imageUrls, // Maps to your Mongoose model array
            };

            const res = await fetch("/api/stations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                setToast({
                    open: true,
                    type: "error",
                    title: "Failed",
                    message: "Failed to create station",
                });
                return;
            }
            
            // Clean up preview object URLs on success
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
            
            onSuccess?.();
            document.getElementById("addstation_modal").close();
        } catch (err) {
            console.error(err);
            setToast({
                open: true,
                type: "error",
                title: "Something went wrong",
                message: err.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
            setUploadingImages(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4 text-blue-950">

                {/* Name */}
                <div>
                    <label className="label text-xs font-semibold">Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="input input-sm bg-white/50 border border-none shadow w-full rounded-2xl focus:outline-0 focus:border-none"
                        value={form.name}
                        onChange={handleChange}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="label text-xs font-semibold">Description</label>
                    <textarea
                        name="description"
                        className="textarea textarea-sm textarea-bordered bg-white/50 border border-none shadow w-full rounded-2xl"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="label text-xs font-semibold">Address</label>
                    <input
                        type="text"
                        name="address"
                        required
                        className="input input-sm input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Address"
                    />
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="label text-xs font-semibold">Latitude</label>
                        <input
                            type="number"
                            step="any"
                            name="latitude"
                            required
                            className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-full"
                            value={form.latitude}
                            onChange={handleChange}
                            placeholder="e.g. 5.907320"
                        />
                    </div>

                    <div>
                        <label className="label text-xs font-semibold">Longitude</label>
                        <input
                            type="number"
                            step="any"
                            name="longitude"
                            required
                            className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-full"
                            value={form.longitude}
                            onChange={handleChange}
                            placeholder="e.g. -0.299188"
                        />
                    </div>
                </div>

                {/* Connectors */}
                <div>
                    <label className="label text-xs font-semibold">Connectors</label>
                    <div className="flex flex-wrap gap-2">
                        {CONNECTOR_OPTIONS.map((connector) => (
                            <label key={connector} className="cursor-pointer label gap-2">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-xs bg-white/80 checkbox-info border-0"
                                    checked={form.connectors.includes(connector)}
                                    onChange={() => handleConnectorChange(connector)}
                                />
                                <span className="label-text text-sm text-blue-950">{connector}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {/* Power */}
                    <div>
                        <label className="label text-xs font-semibold">Power (kW)</label>
                        <input
                            type="number"
                            name="powerKW"
                            required
                            className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
                            value={form.powerKW}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="label text-xs font-semibold">Price per kWh</label>
                        <input
                            type="number"
                            step="0.01"
                            name="pricePerKWh"
                            className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
                            value={form.pricePerKWh}
                            onChange={handleChange}
                        />
                    </div>
                    {/* Outlets */}
                    <div>
                        <label className="label text-xs font-semibold">Outlets</label>
                        <input
                            type="number"
                            name="outlets"
                            min={1}
                            className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
                            value={form.outlets}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="label text-xs font-semibold">Availability</label>
                    <select
                        name="availabilityStatus"
                        className="select select-sm select-bordered bg-white/50 border border-none shadow w-full rounded-3xl text-blue-950"
                        value={form.availabilityStatus}
                        onChange={handleChange}
                    >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                    </select>
                </div>

                {/* Images Upload Section */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="label text-xs font-semibold p-0">Station Images</label>
                        <span className="text-xs text-blue-950/60 font-medium">
                            {imageFiles.length}/{MAX_IMAGES}
                        </span>
                    </div>
                    
                    {/* Preview Grid & Add Button */}
                    <div className="grid grid-cols-4 gap-2 border border-none bg-white/40 p-3 rounded-2xl shadow-sm">
                        {imagePreviews.map((src, index) => (
                            <div key={src} className="relative aspect-square rounded-xl overflow-hidden border border-white/60 bg-white/30 group">
                                <img 
                                    src={src} 
                                    alt={`preview-${index}`} 
                                    className="object-cover w-full h-full"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-90 hover:opacity-100 transition shadow-sm"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}

                        {imageFiles.length < MAX_IMAGES && (
                            <label className="flex flex-col justify-center items-center aspect-square rounded-xl border border-dashed border-blue-950/30 bg-white/30 hover:bg-white/50 cursor-pointer transition text-blue-950/70">
                                <ImagePlus size={20} />
                                <span className="text-[10px] font-medium mt-1">Add Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Create Button */}
                <button
                    type="submit"
                    className="btn btn-neutral border-none bg-blue-950 w-full rounded-full text-white mt-2"
                    disabled={loading || uploadingImages}
                >
                    {loading ? (
                        <span className="flex justify-center items-center gap-2 font-semibold">
                            <Plug size={20} className="animate-ping" />
                            {uploadingImages ? "Uploading Media..." : "Creating..."}
                        </span>
                    ) : (
                        "Create Station"
                    )}
                </button>
            </form>

            <Toast
                open={toast.open}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
            />
        </>
    );
}



// "use client";

// import { Plug } from "lucide-react";
// import { useState } from "react";
// import { useEffect } from "react";
// import Toast from "./toast";

// const CONNECTOR_OPTIONS = ["Type2", "CCS", "CHAdeMO", "GB/T", "Tesla"];

// export default function AddStationForm({ onSuccess }) {
//     const [cpo, setCpo] = useState(null);
//     const [loadingCPO, setLoadingCPO] = useState(true);

//     const [toast, setToast] = useState({
//         open: false,
//         type: "success",
//         title: "",
//         message: "",
//     });

//     useEffect(() => {
//         async function fetchCPO() {
//             const res = await fetch("/api/cpo/me");
//             const data = await res.json();

//             if (res.ok) {
//                 setCpo(data.cpo);
//             }

//             setLoadingCPO(false);
//         }

//         fetchCPO();
//     }, []);


//     const [form, setForm] = useState({
//         name: "",
//         description: "",
//         address: "",
//         latitude: "",
//         longitude: "",
//         connectors: [],
//         powerKW: "",
//         pricePerKWh: "",
//         outlets: "",
//         availabilityStatus: "available",
//     });

//     const [loading, setLoading] = useState(false);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setForm((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleConnectorChange = (connector) => {
//         setForm((prev) => {
//             const exists = prev.connectors.includes(connector);
//             return {
//                 ...prev,
//                 connectors: exists
//                     ? prev.connectors.filter((c) => c !== connector)
//                     : [...prev.connectors, connector],
//             };
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {

//             // Fix parsing for location
//             const lat = parseFloat(form.latitude);
//             const lng = parseFloat(form.longitude);

//             // Simple check to make sure they are within real Earth bounds before sending
//             if (isNaN(lat) || lat < -90 || lat > 90) {
//                 // alert("Please enter a valid Latitude between -90 and 90.");
//                 setToast({
//                     open: true,
//                     type: "warning",
//                     title: "Latitude error",
//                     message: "Please enter a valid Latitude between -90 and 90. (e.g. 5.907320)",
//                 });
//                 setLoading(false);
//                 return;
//             }
//             if (isNaN(lng) || lng < -180 || lng > 180) {
//                 // alert("Please enter a valid Longitude between -180 and 180.");
//                 setToast({
//                     open: true,
//                     type: "warning",
//                     title: "Longitude error",
//                     message: "Please enter a valid Longitude between -180 and 180. (e.g. -0.299188)",
//                 });
//                 setLoading(false);
//                 return;
//             }

//             const payload = {
//                 cpo: cpo._id,
//                 name: form.name,
//                 description: form.description,
//                 address: form.address,
//                 location: {
//                     type: "Point",
//                     // coordinates: [parseFloat(form.longitude), parseFloat(form.latitude),],
//                     coordinates: [lng, lat], // [longitude, latitude] is correct for GeoJSON
//                 },
//                 connectors: form.connectors,
//                 powerKW: Number(form.powerKW),
//                 pricePerKWh: form.pricePerKWh
//                     ? Number(form.pricePerKWh)
//                     : undefined,
//                 outlets: form.outlets,
//                 availabilityStatus: form.availabilityStatus,
//             };

//             const res = await fetch("/api/stations", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (!res.ok) {
//                 setToast({
//                     open: true,
//                     type: "error",
//                     title: "Failed",
//                     message: "Failed to create station",
//                 });
//                 // throw new Error("Failed to create station");
//             }
//             onSuccess?.();
//             document.getElementById("addstation_modal").close();
//         } catch (err) {
//             console.error(err);
//             setToast({
//                 open: true,
//                 type: "error",
//                 title: "Something went wrong",
//                 message: err.message || "Something went wrong.",
//             });

//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <>
//             <form onSubmit={handleSubmit} className="space-y-4 text-blue-950">

//                 {/* Name */}
//                 <div>
//                     <label className="label text-xs">Name</label>
//                     <input
//                         type="text"
//                         name="name"
//                         required
//                         className="input input-sm bg-white/50 border border-none shadow w-full rounded-2xl focus:outline-0 focus:border-none"
//                         value={form.name}
//                         onChange={handleChange}
//                     // placeholder="Name of Station"
//                     />
//                 </div>

//                 {/* Description */}
//                 <div>
//                     <label className="label text-xs">Description</label>
//                     <textarea
//                         name="description"
//                         className="textarea textarea-sm textarea-bordered bg-white/50 border border-none shadow w-full rounded-2xl"
//                         value={form.description}
//                         onChange={handleChange}
//                     // placeholder="Description"
//                     />
//                 </div>

//                 {/* Address */}
//                 <div>
//                     <label className="label text-xs">Address</label>
//                     <input
//                         type="text"
//                         name="address"
//                         required
//                         className="input input-sm input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
//                         value={form.address}
//                         onChange={handleChange}
//                         placeholder="Address"
//                     />
//                 </div>

//                 {/* Coordinates */}
//                 <div className="grid grid-cols-2 gap-3">
//                     <div>
//                         <label className="label text-xs">Latitude</label>
//                         <input
//                             type="number"
//                             step="any"
//                             name="latitude"
//                             required
//                             className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-full"
//                             value={form.latitude}
//                             onChange={handleChange}
//                             placeholder="e.g. 5.907320"
//                         />
//                     </div>

//                     <div>
//                         <label className="label text-xs">Longitude</label>
//                         <input
//                             type="number"
//                             step="any"
//                             name="longitude"
//                             required
//                             className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-full"
//                             value={form.longitude}
//                             onChange={handleChange}
//                             placeholder="e.g. -0.299188"
//                         />
//                     </div>
//                 </div>

//                 {/* Connectors */}
//                 <div>
//                     <label className="label text-xs">Connectors</label>
//                     <div className="flex flex-wrap gap-2">
//                         {CONNECTOR_OPTIONS.map((connector) => (
//                             <label key={connector} className="cursor-pointer label gap-2">
//                                 <input
//                                     type="checkbox"
//                                     className="checkbox checkbox-xs bg-white/80 checkbox-info border-0"
//                                     checked={form.connectors.includes(connector)}
//                                     onChange={() => handleConnectorChange(connector)}
//                                 />
//                                 <span className="label-text text-sm text-blue-950">{connector}</span>
//                             </label>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                     {/* Power */}
//                     <div>
//                         <label className="label text-xs">Power (kW)</label>
//                         <input
//                             type="number"
//                             name="powerKW"
//                             required
//                             className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
//                             value={form.powerKW}
//                             onChange={handleChange}
//                         />
//                     </div>

//                     {/* Price */}
//                     <div>
//                         <label className="label text-xs">Price per kWh</label>
//                         <input
//                             type="number"
//                             step="0.01"
//                             name="pricePerKWh"
//                             className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
//                             value={form.pricePerKWh}
//                             onChange={handleChange}
//                         />
//                     </div>
//                     {/* Outlets */}
//                     <div>
//                         <label className="label text-xs">Outlets</label>
//                         <input
//                             type="number"
//                             name="outlets"
//                             min={1}
//                             className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
//                             value={form.outlets}
//                             onChange={handleChange}
//                         />
//                     </div>
//                 </div>


//                 {/* Status */}
//                 <div>
//                     <label className="label text-xs">Availability</label>
//                     <select
//                         name="availabilityStatus"
//                         className="select select-sm select-bordered bg-white/50 border border-none shadow w-full rounded-3xl text-blue-950"
//                         value={form.availabilityStatus}
//                         onChange={handleChange}
//                     >
//                         <option value="available">Available</option>
//                         <option value="busy">Busy</option>
//                         <option value="offline">Offline</option>
//                     </select>
//                 </div>

//                 {/* Create Button */}
//                 <button
//                     type="submit"
//                     className="btn btn-neutral border-none bg-blue-950 w-full rounded-full text-white"
//                     disabled={loading}
//                 >
//                     {/* {loading ? "Creating..." : "Create Station"} */}
//                     {loading ?
//                         <span className="flex justify-center items-center gap-2 font-semibold">
//                             <Plug size={20} className=" animate-ping" />
//                             Creating...
//                         </span>
//                         : "Create Station"}
//                 </button>
//             </form>


//             <Toast
//                 open={toast.open}
//                 type={toast.type}
//                 title={toast.title}
//                 message={toast.message}
//                 onClose={() => setToast((prev) => ({ ...prev, open: false }))}
//             />
//         </>

//     );
// }
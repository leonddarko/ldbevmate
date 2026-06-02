"use client";

import { useState, useEffect } from "react";

import {
    Building2,
} from "lucide-react";

const PROPERTY_TYPES = [
    "house",
    "apartment",
    "land",
    "office",
    "shop",
    "warehouse",
];

const LISTING_TYPES = [
    "sale",
    "rent",
];

export default function AddPropertyForm({
    onSuccess,
}) {

    const [realtor, setRealtor] = useState(null);

    const [loadingRealtor, setLoadingRealtor] =
        useState(true);

    useEffect(() => {

        async function fetchRealtor() {

            try {

                const res = await fetch(
                    "/api/realtor/me"
                );

                const data = await res.json();

                if (res.ok) {

                    setRealtor(data.realtor);
                }

            } catch (err) {

                console.error(err);

            } finally {

                setLoadingRealtor(false);
            }
        }

        fetchRealtor();

    }, []);

    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "house",
        listingType: "sale",
        price: "",
        bedrooms: "",
        bathrooms: "",
        area: "",
        address: "",
        latitude: "",
        longitude: "",
        amenities: [],
        featured: false,
    });

    const [amenityInput, setAmenityInput] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const addAmenity = () => {

        if (!amenityInput.trim()) return;

        setForm((prev) => ({
            ...prev,
            amenities: [
                ...prev.amenities,
                amenityInput.trim(),
            ],
        }));

        setAmenityInput("");
    };

    const removeAmenity = (index) => {

        setForm((prev) => ({
            ...prev,
            amenities:
                prev.amenities.filter(
                    (_, i) => i !== index
                ),
        }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const payload = {

                realtor: realtor._id,

                title: form.title,

                description: form.description,

                type: form.type,

                listingType: form.listingType,

                price: Number(form.price),

                bedrooms: form.bedrooms
                    ? Number(form.bedrooms)
                    : undefined,

                bathrooms: form.bathrooms
                    ? Number(form.bathrooms)
                    : undefined,

                area: form.area
                    ? Number(form.area)
                    : undefined,

                address: form.address,

                amenities: form.amenities,

                featured: form.featured,

                location: {
                    type: "Point",
                    coordinates: [
                        parseFloat(form.longitude),
                        parseFloat(form.latitude),
                    ],
                },
            };

            const res = await fetch(
                "/api/properties",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {

                throw new Error(
                    "Failed to create property"
                );
            }

            onSuccess?.();

            document
                .getElementById(
                    "addproperty_modal"
                )
                .close();

        } catch (err) {

            console.error(err);

            alert("Something went wrong.");

        } finally {

            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="
                space-y-2
                text-blue-950
            "
        >

            {/* Title */}
            <div>

                <label className="label text-xs">
                    Property Title
                </label>

                <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    className="
                        input input-sm
                        bg-white/50
                        border-none
                        shadow
                        w-full
                        rounded-2xl
                    "
                />

            </div>

            {/* Description */}
            <div>

                <label className="label text-xs">
                    Description
                </label>

                <textarea
                    name="description"
                    rows={2}
                    value={form.description}
                    onChange={handleChange}
                    className="
                        textarea textarea-sm
                        bg-white/50
                        border-none
                        shadow
                        w-full
                        rounded-2xl
                    "
                />

            </div>

            {/* Type + Listing */}
            <div className="grid grid-cols-2 gap-3">

                {/* Property Type */}
                <div>

                    <label className="label text-xs">
                        Property Type
                    </label>

                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="
                            select select-sm
                            bg-white/50
                            border-none
                            shadow
                            w-full
                            rounded-full
                        "
                    >

                        {PROPERTY_TYPES.map((type) => (
                            <option
                                key={type}
                                value={type}
                            >
                                {type}
                            </option>
                        ))}

                    </select>

                </div>

                {/* Listing Type */}
                <div>

                    <label className="label text-xs">
                        Listing Type
                    </label>

                    <select
                        name="listingType"
                        value={form.listingType}
                        onChange={handleChange}
                        className="
                            select select-sm
                            bg-white/50
                            border-none
                            shadow
                            w-full
                            rounded-full
                        "
                    >

                        {LISTING_TYPES.map((type) => (
                            <option
                                key={type}
                                value={type}
                            >
                                {type}
                            </option>
                        ))}

                    </select>

                </div>

            </div>

            {/* Price */}
            <div>

                <label className="label text-xs">
                    Price
                </label>

                <input
                    type="number"
                    name="price"
                    required
                    value={form.price}
                    onChange={handleChange}
                    className="
                        input input-sm
                        bg-white/50
                        border-none
                        shadow
                        w-full
                        rounded-full
                    "
                />

            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-3">

                <div>

                    <label className="label text-xs">
                        Bedrooms
                    </label>

                    <input
                        type="number"
                        name="bedrooms"
                        value={form.bedrooms}
                        onChange={handleChange}
                        className="
                            input input-xs
                            bg-white/50
                            border-none
                            shadow
                            w-full
                            rounded-full
                        "
                    />

                </div>

                <div>

                    <label className="label text-xs">
                        Bathrooms
                    </label>

                    <input
                        type="number"
                        name="bathrooms"
                        value={form.bathrooms}
                        onChange={handleChange}
                        className="
                            input input-xs
                            bg-white/50
                            border-none
                            shadow
                            w-full
                            rounded-full
                        "
                    />

                </div>

                <div>

                    <label className="label text-xs">
                        Area (sqm)
                    </label>

                    <input
                        type="number"
                        name="area"
                        value={form.area}
                        onChange={handleChange}
                        className="
                            input input-xs
                            bg-white/50
                            border-none
                            shadow
                            w-full
                            rounded-full
                        "
                    />

                </div>

            </div>

            {/* Address */}
            <div>

                <label className="label text-xs">
                    Address
                </label>

                <input
                    type="text"
                    name="address"
                    required
                    value={form.address}
                    onChange={handleChange}
                    placeholder="East Legon, Accra..."
                    className="
                        input input-sm
                        bg-white/50
                        border-none
                        shadow
                        w-full
                        rounded-full
                    "
                />

            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">

                <div>

                    <label className="label text-xs">
                        Latitude
                    </label>

                    <input
                        type="number"
                        step="any"
                        name="latitude"
                        required
                        value={form.latitude}
                        onChange={handleChange}
                        className="
                            input input-xs
                            bg-white/50
                            border-none
                            shadow
                            w-full
                            rounded-full
                        "
                    />

                </div>

                <div>

                    <label className="label text-xs">
                        Longitude
                    </label>

                    <input
                        type="number"
                        step="any"
                        name="longitude"
                        required
                        value={form.longitude}
                        onChange={handleChange}
                        className="
                            input input-xs
                            bg-white/50
                            border-none
                            shadow
                            w-full
                            rounded-full
                        "
                    />

                </div>

            </div>

            {/* Amenities */}
            <div>

                <label className="label text-xs">
                    Amenities
                </label>

                <div className="flex gap-2">

                    <input
                        type="text"
                        value={amenityInput}
                        onChange={(e) =>
                            setAmenityInput(
                                e.target.value
                            )
                        }
                        placeholder="Swimming Pool"
                        className="
                            input input-sm
                            bg-white/50
                            border-none
                            shadow
                            w-full
                            rounded-full
                        "
                    />

                    <button
                        type="button"
                        onClick={addAmenity}
                        className="
                            btn btn-sm
                            rounded-full
                            bg-blue-950
                            border-none
                            text-white
                        "
                    >
                        Add
                    </button>

                </div>

                {/* Amenity Tags */}
                <div
                    className="
                        flex flex-wrap
                        gap-2 mt-2
                    "
                >

                    {form.amenities.map(
                        (amenity, index) => (
                            <div
                                key={index}
                                className="
                                    badge
                                    badge-sm
                                    bg-blue-100
                                    text-blue-950
                                    border-none
                                    gap-2
                                    py-3
                                "
                            >

                                <span>
                                    {amenity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeAmenity(
                                            index
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>
                        )
                    )}

                </div>

            </div>

            {/* Featured */}
            <div>

                <label
                    className="
                        flex items-center
                        gap-3 cursor-pointer
                    "
                >

                    <input
                        type="checkbox"
                        name="featured"
                        checked={form.featured}
                        onChange={handleChange}
                        className="
                            checkbox checkbox-xs checkbox-info
                        "
                    />

                    <span className="text-sm">
                        Mark as featured property
                    </span>

                </label>

            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={
                    loading || loadingRealtor
                }
                className="
                    btn btn-neutral
                    border-none
                    bg-blue-950
                    w-full
                    rounded-full
                    text-white
                "
            >

                {loading ? (
                    <span
                        className="
                            flex justify-center
                            items-center gap-2
                            font-semibold
                        "
                    >

                        <Building2
                            size={18}
                            className="animate-pulse"
                        />

                        Creating...

                    </span>
                ) : (
                    "Create Property"
                )}

            </button>

        </form>
    );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";


interface ICategory {
  _id: string;
  name: string;
}

interface ISubcategory {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
}


export default function AdCreationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [categories, setCategories] = useState<(ICategory & { _id: string })[]>(
    []
  );
  const [subcategories, setSubcategories] = useState<
    (ISubcategory & { _id: string })[]
  >([]);
  const [visibleSubcategories, setVisibleSubcategories] = useState<
    (ISubcategory & { _id: string })[]
  >([]);

  const [adForm, setAdForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    city: "",
    country: "",
    images: [] as File[],
  });

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/ads/create");
    }
  }, [status, router]);

  // Fetch categories and subcategories
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [catRes, subcatRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ]);

        if (!catRes.ok || !subcatRes.ok)
          throw new Error("Unable to fetch dropdown data.");

        const cats = await catRes.json();
        const subcats = await subcatRes.json();
        setCategories(cats);
        setSubcategories(subcats);
      } catch (err) {
        console.error(err);
        setFormError("Could not load form options. Please try again.");
      }
    };

    loadInitialData();
  }, []);

  // Filter subcategories based on category selection
  useEffect(() => {
    if (adForm.category) {
      const matched = subcategories.filter(
        (item) => item.category._id === adForm.category
      );
      setVisibleSubcategories(matched);
      setAdForm((prev) => ({ ...prev, subcategory: "" }));
    } else {
      setVisibleSubcategories([]);
    }
  }, [adForm.category, subcategories]);

  const onInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAdForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAdForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    }
  };

  const deleteImage = (index: number) => {
    setAdForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!session?.user.id) {
      setFormError("Please log in before submitting an ad.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      Object.entries(adForm).forEach(([key, value]) => {
        if (key === "images") {
          (value as File[]).forEach((file) => payload.append("images", file));
        } else {
          payload.append(key, value as string);
        }
      });

      const res = await fetch("/api/ads/create", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Submission failed.");
      }

      setFormSuccess(true);
      setAdForm({
        title: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        city: "",
        country: "",
        images: [],
      });

      setTimeout(() => router.push("/my-ads"), 2000);
    } catch (err: any) {
      setFormError(err.message || "Unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader" />
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Post a New Ad</h2>

      {formError && <div className="text-red-600 mb-3">{formError}</div>}
      {formSuccess && (
        <div className="text-green-600 mb-3">
          Ad successfully submitted! Redirecting...
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-5">
        <input
          type="text"
          name="title"
          placeholder="Ad title"
          value={adForm.title}
          onChange={onInputChange}
          required
          maxLength={100}
          className="form-input"
        />

        <textarea
          name="description"
          placeholder="Detailed description"
          value={adForm.description}
          onChange={onInputChange}
          required
          maxLength={2000}
          rows={4}
          className="form-textarea"
        />

        <input
          type="number"
          name="price"
          placeholder="Price in USD"
          value={adForm.price}
          onChange={onInputChange}
          required
          min="0"
          className="form-input"
        />

        <select
          name="category"
          value={adForm.category}
          onChange={onInputChange}
          required
          className="form-select"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          name="subcategory"
          value={adForm.subcategory}
          onChange={onInputChange}
          required
          disabled={!adForm.category}
          className="form-select"
        >
          <option value="">Select subcategory</option>
          {visibleSubcategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="city"
          placeholder="City"
          value={adForm.city}
          onChange={onInputChange}
          required
          className="form-input"
        />

        <input
          type="text"
          name="country"
          placeholder="Country"
          value={adForm.country}
          onChange={onInputChange}
          required
          className="form-input"
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="form-input"
          />
          {adForm.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {adForm.images.map((file, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${idx}`}
                    className="h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => deleteImage(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Link href="/" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Submitting..." : "Post Ad"}
          </button>
        </div>
      </form>
    </section>
  );
}

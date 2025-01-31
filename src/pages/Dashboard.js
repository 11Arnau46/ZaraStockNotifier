import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [productUrl, setProductUrl] = useState("");
    const [size, setSize] = useState("");
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const querySnapshot = await getDocs(collection(db, "products"));
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!productUrl || !size) return;

        await addDoc(collection(db, "products"), {
            productUrl,
            size,
        });

        setProductUrl("");
        setSize("");
        fetchProducts();
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <div className="p-6">
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 mb-4">Logout</button>
            <h2 className="text-xl font-semibold mb-4">Track Zara Products</h2>
            <form onSubmit={handleAddProduct} className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Product URL"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className="border p-2 rounded flex-grow"
                    required
                />
                <input
                    type="text"
                    placeholder="Size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="border p-2 rounded w-24"
                    required
                />
                <button className="bg-blue-500 text-white px-4 py-2">Add</button>
            </form>

            <div className="space-y-2">
                {products.map((product) => (
                    <div key={product.id} className="border p-2 rounded flex justify-between">
                        <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                            {product.productUrl}
                        </a>
                        <span>{product.size}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

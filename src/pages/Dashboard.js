
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export default function Dashboard() {
    const [productUrl, setProductUrl] = useState("");
    const [size, setSize] = useState("");
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user]);

    const fetchProducts = async () => {
        if (!user) return;
        const q = query(collection(db, "products"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!productUrl || !size) return;

        await addDoc(collection(db, "products"), {
            productUrl,
            size,
            userId: user.uid,
        });

        setProductUrl("");
        setSize("");
        fetchProducts();
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const toggleSelection = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const runScraper = async () => {
        if (selectedProducts.length === 0) return;
        const scrapeFunction = httpsCallable(functions, "scrapeZaraProducts");
        try {
            setLogs(prevLogs => [...prevLogs, "Scraper started..."]);
            const result = await scrapeFunction({ productIds: selectedProducts });
            setLogs(prevLogs => [...prevLogs, `Scraper result: ${JSON.stringify(result.data)}`]);
        } catch (error) {
            setLogs(prevLogs => [...prevLogs, `Error: ${error.message}`]);
        }
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
                    <div
                        key={product.id}
                        className={`border p-2 rounded flex justify-between cursor-pointer ${selectedProducts.includes(product.id) ? 'bg-gray-200' : ''}`}
                        onClick={() => toggleSelection(product.id)}
                    >
                        <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                            {product.productUrl}
                        </a>
                        <span>{product.size}</span>
                    </div>
                ))}
            </div>

            <button onClick={runScraper} className="bg-green-500 text-white px-4 py-2 mt-4">Run Scraper</button>

            <div className="mt-6 p-4 bg-gray-900 text-white rounded">
                <h3 className="text-lg font-semibold">Terminal</h3>
                <div className="h-32 overflow-auto text-sm">
                    {logs.map((log, index) => (
                        <p key={index}>{log}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}

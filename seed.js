const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDCJ9sVC9fHtY8Q6J853uwcpdhLOZO09-c",
  authDomain: "retailflow-3e224.firebaseapp.com",
  projectId: "retailflow-3e224",
  storageBucket: "retailflow-3e224.firebasestorage.app",
  messagingSenderId: "198566255315",
  appId: "1:198566255315:web:1b0637129c9a952a2f5226",
  measurementId: "G-E1V3BV7V4W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleProducts = [
  {
    name: "Acoustic Over-Ear Headphones",
    price: 18500,
    category: "Electronics",
    description: "Experience premium, studio-quality sound with active noise cancellation and memory foam earcups for all-day comfort.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    stock: 25
  },
  {
    name: "Chronograph Minimalist Watch",
    price: 34000,
    category: "Accessories",
    description: "A sleek, minimalist design featuring scratch-resistant sapphire crystal glass, stainless steel casing, and premium leather strap.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
    stock: 12
  },
  {
    name: "RGB Mechanical Keyboard",
    price: 15500,
    category: "Electronics",
    description: "Compact 75% mechanical keyboard with tactile brown switches, customizable RGB backlighting, and high-quality PBT keycaps.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80",
    stock: 18
  },
  {
    name: "Retro Canvas Backpack",
    price: 8900,
    category: "Fashion",
    description: "Water-resistant canvas backpack with genuine leather details, dedicated 15-inch laptop sleeve, and multiple utility pockets.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
    stock: 40
  },
  {
    name: "Polarized Classic Sunglasses",
    price: 6200,
    category: "Accessories",
    description: "Timeless classic silhouette with UV400 polarized lenses to reduce glare and protect your eyes in high-end style.",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80",
    stock: 35
  },
  {
    name: "Genuine Leather Biker Jacket",
    price: 45000,
    category: "Fashion",
    description: "Crafted from hand-selected full-grain lambskin leather. Features asymmetrical zip, quilted shoulder patches, and premium satin lining.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80",
    stock: 8
  }
];

async function seedDatabase() {
  console.log("Starting database seeding process...");
  
  try {
    const productsColRef = collection(db, "products");
    
    // 1. Clear existing products to prevent duplicates
    console.log("Fetching existing products...");
    const snapshot = await getDocs(productsColRef);
    if (!snapshot.empty) {
      console.log(`Deleting ${snapshot.size} existing products...`);
      for (const document of snapshot.docs) {
        await deleteDoc(doc(db, "products", document.id));
      }
      console.log("Database cleared.");
    }
    
    // 2. Add sample products
    console.log(`Adding ${sampleProducts.length} new products...`);
    for (const product of sampleProducts) {
      const docRef = await addDoc(productsColRef, product);
      console.log(`Added: "${product.name}" with ID: ${docRef.id}`);
    }
    
    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database: ", error);
    process.exit(1);
  }
}

seedDatabase();

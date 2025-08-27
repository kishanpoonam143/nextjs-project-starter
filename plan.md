Below is the detailed implementation plan in markdown. This plan covers all new files, changes in existing files, error handling, and UI/UX design with modern styling and spacing. Before proceeding, please note that if any file dependencies are missed during development, you must review the complete file structure and adjust the plan accordingly.

---

## 1. Data Storage and Project Structure

- Create a new folder at the project root called “data”.  
- In “data”, add a file named `products.json` with the following initial content:  
```json
[]
```

---

## 2. API Endpoints

### 2.1. Products API Endpoint  
File: `src/app/api/products/route.ts`

- **GET Method:**  
  – Import Node’s fs/promises and path modules.  
  – Read the `data/products.json` file and return the content as JSON.  
  – Include try/catch blocks to catch file-read errors.

- **POST Method:**  
  – Parse the incoming JSON body and validate that the required fields (i.e. product link and category) exist.  
  – (For extra security) Check for an “admin” authentication token/cookie in the request header.  
  – Append a new object with a unique id (e.g. timestamp or UUID), product link, and category, then write back the new array to `products.json`.  
  – Return a success JSON response along with proper error responses if something fails.  

*Example snippet:*  
```typescript
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const productsFile = path.join(process.cwd(), 'data/products.json');

export async function GET() {
  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    const products = JSON.parse(data);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Basic token verification if provided (implement real auth checks)
    const auth = request.headers.get('authorization');
    if (auth !== 'Bearer your_admin_token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { link, category } = body;
    if (!link || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const data = await fs.readFile(productsFile, 'utf-8');
    const products = JSON.parse(data);
    const newProduct = { id: Date.now().toString(), link, category };
    products.push(newProduct);
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    return NextResponse.json({ message: 'Product added', product: newProduct });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
```

---

### 2.2. Admin Authentication API Endpoint  
File: `src/app/api/auth/login/route.ts`

- **POST Method:**  
  – Parse the username and password from the request body.  
  – Validate them against secure values (either environment variables such as `process.env.ADMIN_USERNAME` and `process.env.ADMIN_PASSWORD` or hardcoded for a demo).  
  – If valid, set an httpOnly cookie (e.g., “adminAuth”) in the response headers.  
  – Return a success message; otherwise return a 401 Unauthorized JSON response with error details.

*Example snippet:*  
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('adminAuth', 'your_admin_token', { httpOnly: true, path: '/' });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
```

---

## 3. UI Components

### 3.1. Product Card Component  
File: `src/components/ProductCard.tsx`

- Create a functional component that accepts the product object (`id`, `link`, `category`) as props.  
- Render a card with a modern, minimalist design using Tailwind CSS classes.  
- Display an `<img>` using a placeholder URL based on the product category.  
  – Example:  
   `https://placehold.co/400x300?text=Affiliate+Product+${category}`  
  – Provide highly descriptive alt text (e.g., “Affiliate product image for [category]”).  
- Wrap the entire card in an `<a>` tag with `target="_blank"` that navigates to the affiliate product link.  
- Use an `onError` handler to fall back to a default placeholder image if the image fails to load.

*Example snippet:*  
```tsx
import React from 'react';

interface Product {
  id: string;
  link: string;
  category: string;
}

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const imageUrl = `https://placehold.co/400x300?text=Affiliate+Product+${encodeURIComponent(product.category)}`;
  return (
    <a href={product.link} target="_blank" rel="noopener noreferrer" className="block border rounded-md overflow-hidden shadow hover:shadow-lg transition">
      <img 
        src={imageUrl} 
        alt={`Affiliate product image for ${product.category}`} 
        onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Image+Unavailable"; }} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.category}</h3>
      </div>
    </a>
  );
};
```

---

### 3.2. Product Filter Component  
File: `src/components/ProductFilter.tsx`

- Create a component that renders filtering options as a group of buttons (or a dropdown) for different product categories (e.g., “Fashion-Men”, “Fashion-Women”, “Electronics”, “Books”, etc.).  
- When a button is clicked, fire an `onChange` callback with the selected category.  
- Use modern spacing, hover states, and active styling with Tailwind CSS.

*Example snippet:*  
```tsx
import React from 'react';

interface Props {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const ProductFilter: React.FC<Props> = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="flex space-x-3 overflow-x-auto py-4">
      {categories.map(category => (
        <button 
          key={category} 
          onClick={() => onSelect(category)}
          className={`px-4 py-2 rounded ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} transition`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
```

---

## 4. Pages

### 4.1. Products Showcase Page  
File: `src/app/products/page.tsx`

- Create a page that fetches the list of affiliate products from `/api/products` (using either a client-side fetch in a useEffect hook or via a server component).  
- Use the `ProductFilter` component at the top of the page to filter by category.  
- Maintain state (using `useState`) for the selected filter and update the displayed list of products accordingly.  
- Render the product list as a responsive grid using the `ProductCard` component.  
- Include error handling (e.g., display an error message if the products cannot be fetched).

*Example outline:*  
```tsx
"use client";

import React, { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilter } from '@/components/ProductFilter';

interface Product {
  id: string;
  link: string;
  category: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  // Predefined category list (you can expand this list per Amazon category types)
  const categories = ['Fashion-Men', 'Fashion-Women', 'Electronics', 'Books', 'Home'];

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setError('Failed to load products.'));
  }, []);

  const filteredProducts = filter ? products.filter(p => p.category === filter) : products;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Affiliate Products</h1>
      <ProductFilter 
        categories={categories} 
        selectedCategory={filter} 
        onSelect={setFilter} 
      />
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

### 4.2. Admin Login Page  
File: `src/app/admin/login/page.tsx`

- Create a secure login form that asks for username and password.  
- Upon form submission, POST the credentials to `/api/auth/login` and check the response.  
- On success, store the authentication cookie (or token) and redirect the user to the admin dashboard page (`/admin`).  
- Display error messages for invalid credentials using a modern, clean error banner.

*Example outline:*  
```tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      router.push('/admin');
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-12 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Username</label>
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Password</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Login
        </button>
      </form>
    </div>
  );
}
```

---

### 4.3. Admin Dashboard / Product Addition Page  
File: `src/app/admin/page.tsx`

- Ensure the admin page checks for authentication (for demo purposes, you can check for the cookie on the client side).  
- Render a form for adding a new product that includes input fields for the affiliate product link and product category.  
- On form submission, POST the data to `/api/products`.  
- Display success or error messages after submission and clear the form upon success.  
- Use modern, spacious form design with clear call-to-action buttons.

*Example outline:*  
```tsx
"use client";

import React, { useState } from 'react';

export default function AdminDashboardPage() {
  const [link, setLink] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your_admin_token' // For demo purposes – in production, retrieve from the cookie
      },
      body: JSON.stringify({ link, category })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Product added successfully!');
      setLink('');
      setCategory('');
    } else {
      setMessage(data.error || 'Error adding product.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-12 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
      {message && <div className="mb-4 text-center text-green-600">{message}</div>}
      <form onSubmit={handleAddProduct} className="space-y-4">
        <div>
          <label className="block font-medium">Product Affiliate Link</label>
          <input 
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Product Category</label>
          <input 
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Fashion-Men, Electronics..."
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          Add Product
        </button>
      </form>
    </div>
  );
}
```

---

## 5. Additional UI/UX Considerations

- (Optional) Update the global layout (e.g., in `src/app/globals.css` or a shared header component) to include a navigation bar with links to the Products page and Admin panel.  
- Ensure ample spacing, clean typography, and a consistent color scheme throughout the site.  
- Use placeholder images only where needed and rely on descriptive alt texts and graceful onerror handlers to preserve layout integrity.

---

## Summary

- A new “data” folder with `products.json` is created to store product data in JSON format.  
- API endpoints are implemented in `src/app/api/products/route.ts` (for GET/POST) and `src/app/api/auth/login/route.ts` for admin authentication, including proper error handling.  
- The `ProductCard` and `ProductFilter` components are built to display affiliate products in a modern, grid layout with filtering options.  
- The public Products page (`src/app/products/page.tsx`) fetches and filters products, while the Admin pages (login and dashboard) provide secure forms for adding products.  
- The UI uses Tailwind CSS for a clean, responsive, and stylistically modern look with descriptive images sourced via placeholder URLs.  
- Each component and API endpoint includes robust error handling and follows best practices.

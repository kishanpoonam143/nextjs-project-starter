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
    console.error('Error reading products:', error);
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Basic token verification
    const auth = request.headers.get('authorization');
    if (auth !== 'Bearer admin_token_2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { link, category } = body;
    
    if (!link || !category) {
      return NextResponse.json({ error: 'Missing required fields: link and category' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(link);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }
    
    const data = await fs.readFile(productsFile, 'utf-8');
    const products = JSON.parse(data);
    
    const newProduct = { 
      id: Date.now().toString(), 
      link, 
      category: category.trim(),
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    
    return NextResponse.json({ 
      message: 'Product added successfully', 
      product: newProduct 
    });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

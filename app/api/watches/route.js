import { NextResponse } from 'next/server'
import { readWatches, addWatch, deleteWatch } from '../../../lib/storage.js'

export async function GET() {
  try {
    const watches = readWatches()
    return NextResponse.json(watches)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { brand, model, reference, maxPrice, notes } = body

    if (!brand || !model || !maxPrice) {
      return NextResponse.json(
        { error: 'brand, model, and maxPrice are required' },
        { status: 400 }
      )
    }

    const watch = addWatch({
      brand: brand.trim(),
      model: model.trim(),
      reference: reference?.trim() || '',
      maxPrice: Number(maxPrice),
      notes: notes?.trim() || '',
    })

    return NextResponse.json(watch, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    const watches = deleteWatch(id)
    return NextResponse.json(watches)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DailyMetrics from '@/models/DailyMetrics';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const year  = searchParams.get('year');
    const month = searchParams.get('month');

    const mm        = String(month).padStart(2, '0');
    const startDate = `${year}-${mm}-01`;
    const lastDay   = new Date(Number(year), Number(month), 0).getDate();
    const endDate   = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;

    const metrics = await DailyMetrics.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    return NextResponse.json({ metrics: JSON.parse(JSON.stringify(metrics)) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { date, field, value } = body;

    if (!date || !field) {
      return NextResponse.json({ error: 'date and field required' }, { status: 400 });
    }

    const metrics = await DailyMetrics.findOneAndUpdate(
      { date },
      { $set: { [field]: value } },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ metrics: JSON.parse(JSON.stringify(metrics)) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
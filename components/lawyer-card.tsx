'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Mail, Phone } from 'lucide-react';
import { Star } from 'lucide-react';

interface LawyerCardProps {
  name: string;
  specialty: string;
  location: string;
  experience: string;
  rating: number;
  reviews: number;
  cases: number;
  successRate: number;
  availability: string;
  consultationFee: string;
  bio: string;
}

export function LawyerCard({
  name,
  specialty,
  location,
  experience,
  rating,
  reviews,
  cases,
  successRate,
  availability,
  consultationFee,
  bio
}: LawyerCardProps) {
  return (
    <Card className="w-full">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-muted-foreground">{specialty}</p>
          </div>
          <div className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-full">
            {availability}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-1 text-sm">
            {rating} ({reviews} reviews)
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6v6h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
              {experience} experience
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" stroke="currentColor" strokeWidth="2" />
            </svg>
            {cases} cases handled
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" />
            </svg>
            {successRate}% success rate
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>

        <div className="pt-2">
          <p className="text-sm mb-3">Consultation: {consultationFee}</p>
          <div className="flex gap-2">
            <Button className="flex-1">Book Consultation</Button>
            <Button variant="outline" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Mail className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
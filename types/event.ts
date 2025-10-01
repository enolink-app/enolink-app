export interface Wine {
    id: string;
    name: string;
    country: string;
    type: string;
    description: string;
    harvest: string;
    image: string | null;
    isLocked?: boolean;
    evaluations?: Evaluation[];
}

export interface Evaluation {
    wineId: string;
    userId: string;
    aroma: number;
    flavor: number;
    color: number;
    notes?: string;
    createdAt: Date;
}

export interface Participant {
    id: string;
    name: string;
    isGuest: boolean;
    joinedAt: Date;
    evaluations?: Evaluation[];
}

export interface EventLocation {
    latitude: number;
    longitude: number;
    address?: string;
}

export type EventStatus = "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED" | "CLOSED";

export interface Event {
    id: string;
    name: string;
    organizerId: string;
    participants: Participant[];
    wines: Wine[];
    location?: EventLocation;
    inviteCode: string;
    status: EventStatus;
    dateStart: string | Date;
    dateEnd?: string | Date;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
}

export interface Ranking {
    wineId: string;
    name: string;
    country: string;
    image: string;
    averageRating: number;
    totalEvaluations: number;
    lastUpdated: Date;
}

export interface TopWine extends Ranking {
    description: string;
    type: string;
    eventsCount: number;
}

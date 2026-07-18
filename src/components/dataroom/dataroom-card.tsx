import Link from "next/link";
import { Building2 } from "lucide-react";

import type { DataRoom } from "@/types/entities";

interface CardDataRoomProps {
  room: DataRoom;
}

export default function CardDataRoom({ room }: CardDataRoomProps) {
  return (
    <Link
      href={`/datarooms/${room.id}`}
      className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
    >
      <div className="mb-8 flex size-11 items-center justify-center rounded-lg bg-muted">
        <Building2 className="size-5" />
      </div>

      <h2 className="truncate font-semibold">{room.name}</h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Created {room.createdAt.toLocaleDateString()}
      </p>
    </Link>
  );
}

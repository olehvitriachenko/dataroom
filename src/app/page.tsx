import { CreateDataRoomDialog } from "@/components/dataroom/create-dataroom-dialog";
import { DataRoomList } from "@/components/dataroom/data-room-list";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Acme Corp
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Data Rooms
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Securely organize documents for due diligence.
            </p>
          </div>

          <CreateDataRoomDialog />
        </header>

        <DataRoomList />
      </div>
    </main>
  );
}

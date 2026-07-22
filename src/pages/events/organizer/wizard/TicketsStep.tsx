import TicketTypesEditor from '../TicketTypesEditor';
import { OrganizerTicketType } from '../organizerApi';

export default function TicketsStep({ eventId, ticketTypes, onChange }: { eventId: string; ticketTypes: OrganizerTicketType[]; onChange: () => void }) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold mb-1">Ticket Types</h3>
                <p className="text-xs text-muted-foreground">Every event needs at least one ticket type before it can be published. All tickets on Ignite Room are free for now.</p>
            </div>
            <TicketTypesEditor eventId={eventId} ticketTypes={ticketTypes} onChange={onChange} />
        </div>
    );
}

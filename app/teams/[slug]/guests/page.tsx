import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getGuests } from "@/lib/fetch/guests";
import PageHeader from "@/components/ui/panels/PageHeader";
import Link from "next/link";

export default async function GuestsPage({ params }: { params: { slug: string } }) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const teamId = session.team.id;
  const { slug } = params;

  // Fetch guests
  const guests = await getGuests(teamId);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Guests" description="Manage your guest profiles" />
      
      <div className="mb-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Guest
        </button>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search guests..."
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg"
        />
      </div>
      
      {guests.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.map((guest) => (
                <tr key={guest.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{guest.firstName} {guest.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{guest.email || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{guest.phone || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {guest.blacklisted && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Blacklisted
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    {guest.blacklisted ? (
                      <button className="text-green-600 hover:text-green-900">Remove from Blacklist</button>
                    ) : (
                      <button className="text-red-600 hover:text-red-900">Blacklist</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No guests found</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Your First Guest
          </button>
        </div>
      )}
    </div>
  );
}

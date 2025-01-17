import React, {  useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';


const MyDonationCampaigns = () => {
  const [donators, setDonators] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const queryClient = useQueryClient();
  


  // Fetch donation campaigns (protected route)
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['myDonations'],
    queryFn: async () => {
      const response = await axiosPrivate.get('/donations/my-campaigns'); // Fetch logged-in user's campaigns
      return response.data;
    },
  });

  // Mutation for pausing/unpausing a campaign
  const pauseMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.patch(`/donations/${id}/toggle-pause`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myDonations']); // Refetch campaigns after pausing/unpausing
    },
  });

  // Fetch donators for a specific campaign
  const fetchDonators = async (campaignId) => {
    try {
      const response = await axios.get(`/donations/${campaignId}/donators`); // Fetch donators for a campaign
      setDonators(response.data);
      setSelectedCampaign(campaignId);
      setModalOpen(true); // Open modal
    } catch (error) {
      console.error('Error fetching donators:', error);
    }
  };

  if (isLoading) return <p>Loading campaigns...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Donation Campaigns</h2>

      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Pet Name</th>
            <th className="px-4 py-2">Max Donation</th>
            <th className="px-4 py-2">Donation Progress</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{campaign.petName}</td>
              <td className="px-4 py-2">${campaign.maxDonation}</td>
              <td className="px-4 py-2">
                <div className="relative w-full h-4 bg-gray-200 rounded">
                  {/* Progress bar showing donation progress */}
                  <div
                    className="h-4 bg-green-500 rounded"
                    style={{
                      width: `${Math.min(
                        (campaign.currentDonation / campaign.maxDonation) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm">
                  ${campaign.currentDonation} / ${campaign.maxDonation}
                </span>
              </td>
              <td className="px-4 py-2">
                {/* Pause/Unpause button */}
                <button
                  onClick={() => pauseMutation.mutate(campaign.id)}
                  className={`px-3 py-1 rounded ${
                    campaign.paused ? 'bg-yellow-500' : 'bg-red-500'
                  } text-white mr-2`}
                >
                  {campaign.paused ? 'Unpause' : 'Pause'}
                </button>

                {/* Edit button */}
                <button
                  onClick={() => (window.location.href = `/edit-donation/${campaign.id}`)}
                  className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
                >
                  Edit
                </button>

                {/* View Donators button */}
                <button
                  onClick={() => fetchDonators(campaign.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  View Donators
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for viewing donators */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-lg font-bold mb-4">Donators for Campaign: {selectedCampaign}</h3>
            <ul className="list-disc pl-5">
              {donators.map((donator, index) => (
                <li key={index}>
                  {donator.name} donated ${donator.amount}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonationCampaigns;

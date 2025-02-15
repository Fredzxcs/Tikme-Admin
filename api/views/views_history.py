from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests

class HistoryUpdateReservationStatusView(APIView):
    permission_classes = [AllowAny]

    # Use the correct base URL(s) for your external reservation system
    DINE_IN_API_BASE_URL = 'https://tikme-dine.onrender.com/api/dine-in/'
    EVENT_API_BASE_URL = 'https://tikme-dine.onrender.com/api/event-reservation/'

    def get(self, request, pk):
        """Retrieve reservation details."""
        reservation_type = request.query_params.get('type')
        if not reservation_type:
            return Response({"error": "Type is required for fetching reservation."},
                            status=status.HTTP_400_BAD_REQUEST)
        if reservation_type == 'dine-in':
            base_url = self.DINE_IN_API_BASE_URL
        elif reservation_type == 'event':
            base_url = self.EVENT_API_BASE_URL
        else:
            return Response({"error": "Invalid reservation type."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            get_response = requests.get(f"{base_url}{pk}/")
            if get_response.status_code == 200:
                return Response(get_response.json(), status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": f"Failed to fetch reservation. External API response: {get_response.text}"},
                    status=get_response.status_code)
        except requests.RequestException as e:
            return Response(
                {"error": f"Error communicating with reservation system: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create a new reservation."""
        reservation_type = request.data.get('type')
        reservation_data = request.data.get('reservation_data')
        if not reservation_type or not reservation_data:
            return Response(
                {"error": "Type and reservation data are required."},
                status=status.HTTP_400_BAD_REQUEST)
        if reservation_type == 'dine-in':
            base_url = self.DINE_IN_API_BASE_URL
        elif reservation_type == 'event':
            base_url = self.EVENT_API_BASE_URL
        else:
            return Response(
                {"error": "Invalid reservation type."},
                status=status.HTTP_400_BAD_REQUEST)
        try:
            post_response = requests.post(f"{base_url}", json=reservation_data)
            if post_response.status_code in [200, 201]:
                return Response(
                    {"message": f"{reservation_type.capitalize()} reservation created successfully."},
                    status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {"error": f"Failed to create {reservation_type} reservation. External API response: {post_response.text}"},
                    status=post_response.status_code)
        except requests.RequestException as e:
            return Response(
                {"error": f"Error communicating with reservation system: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        reservation_type = request.data.get('type')
        status_update = request.data.get('status')
        reservation_date = request.data.get('reservation_date')
        reservation_time = request.data.get('reservation_time')

        if not reservation_type:
            return Response({"error": "Type is required for updating reservation."}, status=status.HTTP_400_BAD_REQUEST)
        if not status_update:
            return Response({"error": "Status field is required for updating reservation."}, status=status.HTTP_400_BAD_REQUEST)

        # Status Mapping
        status_mapping = {
            "Incoming": "Confirmed",
            "Ongoing": "Ongoing",
            "Done": "Completed",
            "Cancelled": "Cancelled",
            "Overdue": "Overdue"
        }
        mapped_status = status_mapping.get(status_update, status_update)

        if mapped_status not in ['Confirmed', 'Ongoing', 'Completed', 'Cancelled', 'Overdue']:
            return Response({"error": f"'{mapped_status}' is not a valid choice."}, status=status.HTTP_400_BAD_REQUEST)

        # Select API base URL
        if reservation_type == 'dine-in':
            base_url = self.DINE_IN_API_BASE_URL
        elif reservation_type == 'event':
            base_url = self.EVENT_API_BASE_URL
        else:
            return Response({"error": "Invalid reservation type."}, status=status.HTTP_400_BAD_REQUEST)

        # Prepare data for PATCH request
        update_data = {
            "status": mapped_status
        }
        if reservation_date:
            update_data["reservation_date"] = reservation_date
        if reservation_time:
            update_data["reservation_time"] = reservation_time

        print(f"PATCH data being sent to external API: {update_data}")

        try:
            patch_response = requests.patch(f"{base_url}{pk}/", json=update_data)
            print(f"PATCH response from external API: {patch_response.status_code} - {patch_response.text}")

            if patch_response.status_code == 200:
                return Response({"message": f"{reservation_type.capitalize()} reservation updated to {mapped_status}."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": f"Failed to update {reservation_type} reservation. External API response: {patch_response.text}"}, status=patch_response.status_code)
        except requests.RequestException as e:
            return Response({"error": f"Error communicating with reservation system: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

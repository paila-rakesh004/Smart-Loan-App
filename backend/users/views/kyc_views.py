from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class KYCViewSet(ViewSet):

    permission_classes = [IsAuthenticated]

    def kyc_status(self, request):
        user = request.user

        has_pan = bool(user.pan_card_file and user.pan_card_file.name)
        has_aadhar = bool(user.aadhar_card_file and user.aadhar_card_file.name)
        has_photo = bool(user.passport_photo and user.passport_photo.name)

        return Response({
            "is_kyc_complete": has_pan and has_aadhar and has_photo,
            "documents_present": {
                "pan_card": has_pan,
                "aadhar_card": has_aadhar,
                "passport_photo": has_photo
            },
            "urls": {
                "pan_card": request.build_absolute_uri(user.pan_card_file.url) if has_pan else None,
                "aadhar_card": request.build_absolute_uri(user.aadhar_card_file.url) if has_aadhar else None,
                "passport_photo": request.build_absolute_uri(user.passport_photo.url) if has_photo else None
            }
        })
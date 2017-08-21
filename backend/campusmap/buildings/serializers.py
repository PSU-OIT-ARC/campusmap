from rest_framework import serializers

from .models import Building


class BuildingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Building
        fields = '__all__'

    url = serializers.HyperlinkedIdentityField(view_name='building-detail')
    building_url = serializers.URLField()

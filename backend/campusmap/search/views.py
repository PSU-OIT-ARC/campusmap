from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.contenttypes.models import ContentType

from rest_framework.exceptions import NotFound, ParseError
from rest_framework.response import Response
from rest_framework.views import APIView

from ..buildings.models import Building
from ..buildings.serializers import BuildingSerializer


class BaseSearchView(APIView):

    def get_response(self, results):
        results = self.serialize_results(results)
        count = len(results)
        return Response({
            'results': results,
            'count': count
        })

    def serialize_results(self, results):
        context = {'request': self.request}
        serializer = BuildingSerializer(results, context=context, many=True)
        return serializer.data


class SearchView(BaseSearchView):

    not_found_message = 'No results found matching term: {term}'

    def get(self, request):
        if 'q' in request.query_params:
            term = request.query_params['q'].strip()
        else:
            raise ParseError('Missing query parameter: q')
        if not term:
            raise ParseError('Blank query parameter: q')
        queryset = Building.objects.filter(Q(name__icontains=term) | Q(code__icontains=term))
        results = queryset.all()
        if not len(results):
            raise NotFound(self.not_found_message.format_map(locals()))
        return self.get_response(results)


class SearchByIDView(BaseSearchView):

    not_found_message = 'No results found matching ID: {app}.{model}.{id}'

    def get(self, request, app, model, id):
        lookup_field = request.query_params.get('f', '').strip() or 'pk'
        content_type = ContentType.objects.get(app_label=app, model=model)
        try:
            result = content_type.get_object_for_this_type(**{lookup_field: id})
        except ObjectDoesNotExist:
            raise NotFound(self.not_found_message.format_map(locals()))
        except ValueError as exc:
            raise ParseError(f'Search by ID lookup failed for {app}.{model}.{id}: {exc}')
        return self.get_response([result])

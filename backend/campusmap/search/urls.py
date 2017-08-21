from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.SearchView.as_view(), name='search'),

    url(r'^(?P<app>[a-z]+)\.(?P<model>[a-z]+)\.(?P<id>.+)$',
        views.SearchByIDView.as_view(), name='search-by-id'),
]

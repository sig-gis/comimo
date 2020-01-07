from django.shortcuts import render
from django.http import JsonResponse
import ee

def authGEE():
    return 'authenticated';

def test(request):
    return JsonResponse({'test':authGEE});

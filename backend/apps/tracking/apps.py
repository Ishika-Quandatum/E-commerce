from django.apps import AppConfig

class TrackingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.tracking'

    def ready(self):
        # Implicitly imports signals if they are in models.py
        # If we had a separate signals.py, we would import it here.
        pass

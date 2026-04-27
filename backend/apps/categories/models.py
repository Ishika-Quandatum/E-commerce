from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    image = models.ImageField(upload_to='categories/', null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

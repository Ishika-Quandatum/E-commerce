from rest_framework import serializers
from .models import Category
from apps.returns.models import ReturnPolicy


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)
    children = serializers.SerializerMethodField()
    return_policy = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'parent', 'products_count', 'children', 'return_policy']

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []

    def get_return_policy(self, obj):
        policy = obj.return_policies.first()
        if not policy:
            return {
                'id': None,
                'return_window_days': 7,
                'is_returnable': True,
                'policy_text': f"Products in {obj.name} can be returned within 7 days of delivery."
            }
        return {
            'id': policy.id,
            'return_window_days': policy.return_window_days,
            'is_returnable': policy.is_returnable,
            'policy_text': policy.policy_text
        }

    def update(self, instance, validated_data):
        return_policy_data = self.initial_data.get('return_policy')
        if return_policy_data is not None:
            policy, created = ReturnPolicy.objects.get_or_create(category=instance)
            policy.is_returnable = return_policy_data.get('is_returnable', policy.is_returnable)
            policy.return_window_days = int(return_policy_data.get('return_window_days', policy.return_window_days))
            policy.policy_text = return_policy_data.get('policy_text', policy.policy_text)
            policy.save()
        return super().update(instance, validated_data)

    def create(self, validated_data):
        instance = super().create(validated_data)
        return_policy_data = self.initial_data.get('return_policy')
        if return_policy_data is not None:
            ReturnPolicy.objects.create(
                category=instance,
                is_returnable=return_policy_data.get('is_returnable', True),
                return_window_days=int(return_policy_data.get('return_window_days', 7)),
                policy_text=return_policy_data.get('policy_text', "")
            )
        return instance


# Generated by Django 5.2.4 on 2025-07-20 15:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classroom', '0001_initial'),
        ('tutors', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='classroom',
            name='tutor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tutors.tutor'),
        ),
    ]

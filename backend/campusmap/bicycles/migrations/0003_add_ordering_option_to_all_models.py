from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bicycles', '0002_bicycleroute'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='bicycleparking',
            options={'ordering': ['capacity'], 'verbose_name_plural': 'bicycle parking'},
        ),

        migrations.AlterModelOptions(
            name='bicycleroute',
            options={'ordering': ['classification', 'bike_there_classification']},
        ),
    ]

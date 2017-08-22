from setuptools import setup, find_packages


setup(
    name='psu.oit.wdt.campusmap',
    description='PSU Campus Map',
    version='1.0.0.dev0',
    author='PSU - OIT - WDT',
    author_email='webteam@pdx.edu',
    maintainer='Wyatt Baldwin',
    maintainer_email='wbaldwin@pdx.edu',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'django>=1.11.4',
        'django-arcutils>=2.23.0',
        'django-local-settings>=1.0b7',
        'django-pgcli>=0.0.2',
        'djangorestframework>=3.6.4',
        'Markdown>=2.6.9',
        'psycopg2>=2.7.3',
        'psu.oit.arc.tasks',
    ],
    extras_require={
        'dev': [
            'coverage',
            'django-cors-headers>=2.1.0',
            'flake8',
            'gunicorn',
        ]
    }
)

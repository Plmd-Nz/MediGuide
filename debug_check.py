import pandas as pd
from services.interpretation_besoin import interpreter_demande_locale


df = pd.read_csv('donnees/dataset_prepare/dataset_prepare.csv')
for texte in ['cholera', 'cholera et ORL', 'Problemes ORL', 'Fièvre', 'Médecine générale', 'grossesse', 'Soin ORL']:
    try:
        besoin, cats = interpreter_demande_locale(texte, df)
        print('TEXT:', texte)
        print('CATS:', cats)
        print('CAP:', besoin.capacites_recherchees)
        print('SERV:', besoin.services_recherches)
        print('SPEC:', besoin.specialites_recherchees)
    except Exception as e:
        print('TEXT:', texte, 'ERROR:', type(e).__name__, e)

import { Injectable } from '@sonata/common';
import { InjectionType } from '@sonata/common/dist/enums/InjectionType';

@Injectable(InjectionType.SERVICE)
export class Translator {
  private readonly _translations: { [key: string]: string };

  public constructor() {
    this._translations = {
      hello: 'Bonjour',
      goodbye: 'Au revoir',
      welcome: 'Bienvenue',
      good: 'Bien',
      bad: 'Mauvais',
      unknown: 'Inconnu',
      yes: 'Oui',
      no: 'Non',
      ok: 'Ok',
      cancel: 'Annuler',
      close: 'Fermer',
      save: 'Sauvegarder',
      delete: 'Supprimer',
      edit: 'Editer',
      add: 'Ajouter',
      search: 'Rechercher',
      reset: 'Réinitialiser',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      first: 'Premier',
      last: 'Dernier',
      page: 'Page',
      of: 'de',
      items: 'éléments',
      item: 'élément',
      'no items': 'Aucun élément',
      'no item': 'Aucun élément',
      'no result': 'Aucun résultat',
      'no results': 'Aucun résultat',
      'no data': 'Aucune donnée',
      'no data available': 'Aucune donnée disponible',
      'no data to display': 'Aucune donnée à afficher',
      'no data to show': 'Aucune donnée à afficher',
      'no data to export': 'Aucune donnée à exporter',
      'no data to print': 'Aucune donnée à imprimer',
      'no data to export as': 'Aucune donnée à exporter en',
      'no data to print as': 'Aucune donnée à imprimer en',
      'no data to download': 'Aucune donnée à télécharger',
      'no data to download as': 'Aucune donnée à télécharger en',
      'no data to preview': 'Aucune donnée à prévisualiser',
      'no data to preview as': 'Aucune donnée à prévisualiser en',
    };
  }

  public translate(key: string): string {
    return this._translations[key] || key;
  }
}

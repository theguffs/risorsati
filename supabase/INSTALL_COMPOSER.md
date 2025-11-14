# Come Installare Composer su Windows

## Metodo 1: Installer Windows (Consigliato)

1. Vai su: https://getcomposer.org/download/
2. Scarica **Composer-Setup.exe**
3. Esegui l'installer e segui le istruzioni
4. Verifica l'installazione:
   ```bash
   composer --version
   ```

## Metodo 2: Download Manuale (Senza Installer)

1. Vai su: https://getcomposer.org/download/
2. Scarica `composer.phar`
3. Metti `composer.phar` nella root del progetto
4. Usa:
   ```bash
   php composer.phar install
   ```

## Metodo 3: Usa PHP da MAMP

Se usi MAMP, PHP è già installato. Puoi:

1. Aggiungi PHP di MAMP al PATH:
   - Apri "Variabili d'ambiente" in Windows
   - Aggiungi al PATH: `C:\MAMP\bin\php\php[versione]\`
   - Riavvia il terminale

2. Poi installa Composer normalmente

## Verifica

Dopo l'installazione, verifica che funzioni:

```bash
composer --version
```

Dovresti vedere qualcosa come: `Composer version 2.x.x`

## Installazione Dipendenze

Una volta installato Composer, nella root del progetto esegui:

```bash
composer install
```

Questo installerà PhpSpreadsheet nella cartella `vendor/`.









import { Observable } from '@nativescript/core';

interface Game {
    id: string;
    name: string;
    imageUrl: string;
    status: string;
    buttonText: string;
    installed: boolean;
    size?: string;
    installProgress?: number;
}

export class HelloWorldModel extends Observable {
    private _userStatus: string;
    private _games: Game[];

    constructor() {
        super();

        this._userStatus = "Verbunden mit Windows PC";
        this._games = [
            {
                id: '1',
                name: 'Minecraft',
                imageUrl: 'https://via.placeholder.com/150',
                status: 'Installiert',
                buttonText: 'Spielen',
                installed: true,
                size: '2.5 GB'
            },
            {
                id: '2',
                name: 'Fortnite',
                imageUrl: 'https://via.placeholder.com/150',
                status: 'Update verfügbar',
                buttonText: 'Aktualisieren',
                installed: true,
                size: '45 GB'
            },
            {
                id: '3',
                name: 'Valorant',
                imageUrl: 'https://via.placeholder.com/150',
                status: 'Nicht installiert',
                buttonText: 'Installieren',
                installed: false,
                size: '20 GB'
            }
        ];
    }

    get userStatus(): string {
        return this._userStatus;
    }

    get games(): Game[] {
        return this._games;
    }

    onGameTap(args: any) {
        const game = this._games[args.index];
        console.log(`Spiel ausgewählt: ${game.name}`);
    }

    onActionTap(args: any) {
        const game = args.object.bindingContext as Game;
        console.log(`Aktion für Spiel: ${game.name}`);
        
        if (!game.installed) {
            // Installation simulieren
            game.status = 'Installiere...';
            game.buttonText = 'Installiere';
            game.installProgress = 0;
            this.notifyPropertyChange('games', this._games);
            
            const interval = setInterval(() => {
                game.installProgress += 10;
                this.notifyPropertyChange('games', this._games);
                
                if (game.installProgress >= 100) {
                    clearInterval(interval);
                    game.status = 'Installiert';
                    game.buttonText = 'Spielen';
                    game.installed = true;
                    delete game.installProgress;
                    this.notifyPropertyChange('games', this._games);
                }
            }, 500);
        }
    }
}
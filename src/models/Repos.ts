import { Table, Model, Column, DataType, Default, PrimaryKey } from "sequelize-typescript";

/**
 * Modello per rappresentare i dettagli di un repository.
 */
@Table({
    tableName: "repo_details",
    timestamps: true, // Aggiunge automaticamente `createdAt` e `updatedAt`
})
export default class RepoDetails extends Model {
    /**
         * Identificatore unico del repository (UUID).
         */
    @PrimaryKey
    @Default(DataType.UUIDV4) // Genera automaticamente un UUID
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    id!: string;

    /**
     * ID di GitHub del repository.
     */
    @Column({
        type: DataType.INTEGER, // Usa INTEGER per l'ID di GitHub
        allowNull: false,
        unique: true, // Assicura che sia univoco
    })
    githubId!: number;

    /**
     * Timestamp ISO 8601 che indica quando il repository è stato creato.
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    created!: string;

    /**
     * Timestamp ISO 8601 che indica quando il repository è stato aggiornato.
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    updated!: string;

    /**
     * URL Git del repository.
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    url!: string;

    /**
     * Nome del repository.
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title!: string;

    /**
     * Lista di topic associati al repository (memorizzati come JSON).
     */
    /**
        * Lista di topic associati al repository (memorizzati come JSON).
        */
    @Column({
        type: DataType.TEXT, // Usa TEXT per memorizzare JSON
        allowNull: false,
        defaultValue: '[]', // Valore predefinito: un array vuoto in formato JSON
    })
    private _topics!: string;

    // Getter per convertire il JSON in array
    get topics(): string[] {
        return this._topics ? JSON.parse(this._topics) : [];
    }

    // Setter per convertire l'array in JSON
    set topics(value: string[]) {
        this._topics = JSON.stringify(value);
    }

    /**
     * Descrizione opzionale del repository.
     */
    @Column({
        type: DataType.STRING,
        allowNull: true, // Permette valori null
    })
    description?: string;

    /**
     * URL o percorso dell'immagine thumbnail opzionale.
     */
    @Column({
        type: DataType.STRING,
        allowNull: true, // Permette valori null
    })
    thumbnail?: string;

    /**
     * Contenuto opzionale del README del repository.
     */
    @Column({
        type: DataType.STRING,
        allowNull: true, // Permette valori null
    })
    readme?: string;

    /**
     * Contenuto opzionale dei link del repository (codificato in base64).
     */
    @Column({
        type: DataType.STRING,
        allowNull: true, // Permette valori null
    })
    links?: string;
}

import {
    Table,
    Model,
    Column,
    DataType,
    HasOne,
} from "sequelize-typescript";
import AnimeDetails from "./AnimeDetails";
import zlib from "zlib";

/**
 * Modello per rappresentare le immagini associate agli anime.
 */
@Table({
    tableName: "asset_images", // Nome della tabella
    timestamps: true, // Aggiunge automaticamente `createdAt` e `updatedAt`
})
export default class AssetImages extends Model {
    /**
     * Identificatore unico dell'immagine.
     */
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id!: string;

    /**
     * Riferimento all'asset associato.
     */
    @HasOne(() => AnimeDetails, { sourceKey: "id", foreignKey: "assetReference", as: "detail" })
    detail!: AnimeDetails;

    /**
     * URL di origine dell'immagine o il suo identificativo.
     */
    @Column({
        type: DataType.TEXT, // Base64 per immagini o link
        allowNull: true,
        defaultValue: null,
    })
    origin!: string | null;

    /**
     * Miniatura dell'immagine, in formato base64 o URL.
     */
    @Column({
        type: DataType.BLOB, // Salviamo i dati compressi come binari
        allowNull: true,
        defaultValue: null,
        get() {
            // Decomprime i dati quando vengono letti
            const compressedThumbnail = this.getDataValue("thumbnail");
            if (compressedThumbnail) {
                return zlib.gunzipSync(Buffer.from(compressedThumbnail)).toString("utf-8");
            }
            return null;
        },
        set(value: string | null) {
            // Comprime i dati prima di salvarli
            if (value) {
                this.setDataValue("thumbnail", zlib.gzipSync(Buffer.from(value, "utf-8")));
            } else {
                this.setDataValue("thumbnail", null);
            }
        },
    })
    thumbnail!: string | null;
}

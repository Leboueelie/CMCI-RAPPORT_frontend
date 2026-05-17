import { z } from "zod";

export const membreSchema = z.object({
  assembleeId: z.string().min(1, "L'assemblée est requise"),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  dateNaissance: z.string().optional(),
  dateConversion: z.string().optional(),
  contact: z.string().optional(),
  profession: z.string().optional(),
  baptiseEau: z.boolean().optional(),
  baptiseSaintEsprit: z.boolean().optional(),
  liensBrises: z.boolean().optional(),
  situationMatrimoniale: z.string().optional(),
  nombreEnfants: z.coerce.number().int().min(0).optional(),
  faiseurDisciple: z.string().optional(),
  niveauAcademique: z.string().optional(),
  statut: z.enum(["ACTIF", "RETROGRADE"]).optional(),
  fonctionIds: z.array(z.string()).optional(),
  photo: z.string().optional(),
  notes: z.string().optional(),
});

export type MembreFormData = z.infer<typeof membreSchema>;

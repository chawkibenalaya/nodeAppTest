/**
 * Moteur de formulaire dynamique "schema-driven"
 * React + TypeScript + react-hook-form
 *
 * Principes :
 *  - Toute la logique métier (visibilité, required, validation) vit dans un
 *    schéma déclaratif statique — sérialisable en JSON (backend-friendly).
 *  - Chaque champ ne re-render QUE si une de ses dépendances change
 *    (useWatch ciblé sur les champs référencés par ses conditions).
 *  - shouldUnregister: true → un champ masqué disparaît des valeurs et
 *    de la validation automatiquement.
 *
 * npm i react-hook-form
 */

import React, { useMemo } from 'react';
import {
  useForm,
  useFormContext,
  useFormState,
  useWatch,
  FormProvider,
  type RegisterOptions,
  type FieldValues,
} from 'react-hook-form';

/* =========================================================================
   1. LE SCHÉMA — la seule chose que tu écris pour un nouveau formulaire
   ========================================================================= */

type Primitive = string | number | boolean | null | undefined;
export type FormValues = Record<string, Primitive>;

/** Conditions déclaratives et composables (sérialisables en JSON) */
export type Condition =
  | { field: string; op: 'eq' | 'neq' | 'gt' | 'truthy'; value?: Primitive }
  | { field: string; op: 'in'; value: Primitive[] }
  | { and: Condition[] }
  | { or: Condition[] }
  | { not: Condition };

export type ValidatorRule =
  | { type: 'minLength'; value: number; message: string }
  | { type: 'maxLength'; value: number; message: string }
  | { type: 'min'; value: number; message: string }
  | { type: 'pattern'; value: RegExp; message: string }
  /** Validation métier libre — reçoit la valeur ET toutes les valeurs du form */
  | {
      type: 'custom';
      message?: string;
      validate: (value: Primitive, all: FormValues) => boolean | string;
    };

interface BaseField {
  name: string;
  label: string;
  /** Affiché seulement si la condition est vraie (absent = toujours visible) */
  visibleWhen?: Condition;
  /** true = toujours requis, Condition = requis seulement si vraie */
  requiredWhen?: true | Condition;
  validators?: ValidatorRule[];
  defaultValue?: Primitive;
}

interface TextField extends BaseField {
  component: 'text';
  placeholder?: string;
}
interface NumberField extends BaseField {
  component: 'number';
}
interface SelectField extends BaseField {
  component: 'select';
  options: { value: string; label: string }[];
}
interface CheckboxField extends BaseField {
  component: 'checkbox';
}

export type FieldDef = TextField | NumberField | SelectField | CheckboxField;
export type FormSchema = FieldDef[];

/* =========================================================================
   2. ÉVALUATION DES CONDITIONS + EXTRACTION DES DÉPENDANCES
   ========================================================================= */

export function evalCondition(cond: Condition, values: FormValues): boolean {
  if ('and' in cond) return cond.and.every((c) => evalCondition(c, values));
  if ('or' in cond) return cond.or.some((c) => evalCondition(c, values));
  if ('not' in cond) return !evalCondition(cond.not, values);

  const v = values[cond.field];
  switch (cond.op) {
    case 'eq':
      return v === cond.value;
    case 'neq':
      return v !== cond.value;
    case 'in':
      return cond.value.includes(v);
    case 'gt':
      return typeof v === 'number' && typeof cond.value === 'number' && v > cond.value;
    case 'truthy':
      return Boolean(v);
  }
}

/** Liste des champs dont dépend une condition — c'est la clé de la perf */
export function collectDeps(cond?: Condition): string[] {
  if (!cond) return [];
  if ('and' in cond) return cond.and.flatMap(collectDeps);
  if ('or' in cond) return cond.or.flatMap(collectDeps);
  if ('not' in cond) return collectDeps(cond.not);
  return [cond.field];
}

/* =========================================================================
   3. VALIDATORS DU SCHÉMA → RULES react-hook-form
   ========================================================================= */

function buildRules(field: FieldDef, required: boolean): RegisterOptions {
  const rules: RegisterOptions = {
    required: required ? `${field.label} est requis` : false,
  };

  const customValidators: Record<
    string,
    (v: Primitive, all: FieldValues) => true | string
  > = {};

  (field.validators ?? []).forEach((rule, i) => {
    switch (rule.type) {
      case 'minLength':
        rules.minLength = { value: rule.value, message: rule.message };
        break;
      case 'maxLength':
        rules.maxLength = { value: rule.value, message: rule.message };
        break;
      case 'min':
        rules.min = { value: rule.value, message: rule.message };
        break;
      case 'pattern':
        rules.pattern = { value: rule.value, message: rule.message };
        break;
      case 'custom':
        customValidators[`custom_${i}`] = (v, all) => {
          const result = rule.validate(v, all as FormValues);
          if (result === true) return true;
          return typeof result === 'string' ? result : rule.message ?? 'Valeur invalide';
        };
        break;
    }
  });

  if (Object.keys(customValidators).length > 0) {
    rules.validate = customValidators;
  }
  return rules;
}

/* =========================================================================
   4. REGISTRY : type de composant → implémentation UI
      (pour ajouter un type : une entrée ici + une variante dans FieldDef)
   ========================================================================= */

interface FieldComponentProps {
  field: FieldDef;
  required: boolean;
  rules: RegisterOptions;
}

/** Erreur scopée au champ : ne re-render pas quand d'autres champs changent */
function FieldError({ name }: { name: string }) {
  const { errors } = useFormState({ name });
  const error = errors[name];
  if (!error) return null;
  return <span role="alert" style={{ color: '#c0392b', fontSize: 13 }}>{String(error.message)}</span>;
}

function Label({ field, required }: { field: FieldDef; required: boolean }) {
  return (
    <label htmlFor={field.name}>
      {field.label}
      {required && ' *'}
    </label>
  );
}

const TextInput: React.FC<FieldComponentProps> = ({ field, required, rules }) => {
  const { register } = useFormContext();
  return (
    <div style={fieldStyle}>
      <Label field={field} required={required} />
      <input
        id={field.name}
        type="text"
        placeholder={(field as TextField).placeholder}
        {...register(field.name, rules)}
      />
      <FieldError name={field.name} />
    </div>
  );
};

const NumberInput: React.FC<FieldComponentProps> = ({ field, required, rules }) => {
  const { register } = useFormContext();
  return (
    <div style={fieldStyle}>
      <Label field={field} required={required} />
      <input
        id={field.name}
        type="number"
        {...register(field.name, { ...rules, valueAsNumber: true })}
      />
      <FieldError name={field.name} />
    </div>
  );
};

const SelectInput: React.FC<FieldComponentProps> = ({ field, required, rules }) => {
  const { register } = useFormContext();
  const options = (field as SelectField).options;
  return (
    <div style={fieldStyle}>
      <Label field={field} required={required} />
      <select id={field.name} {...register(field.name, rules)}>
        <option value="">-- Sélectionner --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError name={field.name} />
    </div>
  );
};

const CheckboxInput: React.FC<FieldComponentProps> = ({ field, required, rules }) => {
  const { register } = useFormContext();
  return (
    <div style={{ ...fieldStyle, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <input id={field.name} type="checkbox" {...register(field.name, rules)} />
      <Label field={field} required={required} />
      <FieldError name={field.name} />
    </div>
  );
};

const registry: Record<FieldDef['component'], React.FC<FieldComponentProps>> = {
  text: TextInput,
  number: NumberInput,
  select: SelectInput,
  checkbox: CheckboxInput,
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginBottom: 16,
};

/* =========================================================================
   5. LE CŒUR : <SchemaField> — visibilité/required réactifs et ciblés
   ========================================================================= */

function SchemaField({ field }: { field: FieldDef }) {
  const { control } = useFormContext();

  // Dépendances = uniquement les champs référencés par les conditions de CE champ
  const deps = useMemo(() => {
    const set = new Set<string>([
      ...collectDeps(field.visibleWhen),
      ...(typeof field.requiredWhen === 'object' ? collectDeps(field.requiredWhen) : []),
    ]);
    return [...set];
  }, [field]);

  // useWatch ciblé : ce champ ne re-render QUE si une de ses deps change.
  // Un champ sans condition (deps = []) ne re-render jamais à cause des autres.
  const watched = useWatch({ control, name: deps }) as Primitive[];
  const depValues: FormValues = useMemo(
    () => Object.fromEntries(deps.map((name, i) => [name, watched?.[i]])),
    [deps, watched],
  );

  const visible = !field.visibleWhen || evalCondition(field.visibleWhen, depValues);
  const required =
    field.requiredWhen === true ||
    (typeof field.requiredWhen === 'object' && evalCondition(field.requiredWhen, depValues));

  // shouldUnregister: true (au niveau du useForm) => la valeur et les erreurs
  // du champ sont automatiquement nettoyées quand il est démonté ici.
  if (!visible) return null;

  const rules = buildRules(field, required);
  const Component = registry[field.component];
  return <Component field={field} required={required} rules={rules} />;
}

/* =========================================================================
   6. LE FORMULAIRE GÉNÉRIQUE — réutilisable pour n'importe quel schéma
   ========================================================================= */

export function DynamicForm({
  schema,
  onSubmit,
}: {
  schema: FormSchema;
  onSubmit: (values: FormValues) => void;
}) {
  const defaultValues = useMemo(
    () =>
      Object.fromEntries(
        schema
          .filter((f) => f.defaultValue !== undefined)
          .map((f) => [f.name, f.defaultValue]),
      ),
    [schema],
  );

  const methods = useForm<FormValues>({
    mode: 'onTouched',
    shouldUnregister: true, // champ caché => retiré des valeurs et de la validation
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        {schema.map((field) => (
          <SchemaField key={field.name} field={field} />
        ))}
        <button type="submit">Envoyer</button>
      </form>
    </FormProvider>
  );
}

/* =========================================================================
   7. EXEMPLE DE SCHÉMA MÉTIER — cascade select → champs → sous-champs
      C'est le SEUL bloc à écrire pour un nouveau formulaire.
   ========================================================================= */

export const demandeFinancementSchema: FormSchema = [
  {
    name: 'typeClient',
    component: 'select',
    label: 'Type de client',
    requiredWhen: true,
    options: [
      { value: 'particulier', label: 'Particulier' },
      { value: 'entreprise', label: 'Entreprise' },
    ],
  },

  // --- Branche ENTREPRISE ---
  {
    name: 'siret',
    component: 'text',
    label: 'Numéro SIRET',
    placeholder: '14 chiffres',
    visibleWhen: { field: 'typeClient', op: 'eq', value: 'entreprise' },
    requiredWhen: { field: 'typeClient', op: 'eq', value: 'entreprise' },
    validators: [
      { type: 'pattern', value: /^\d{14}$/, message: 'Le SIRET doit contenir exactement 14 chiffres' },
    ],
  },

  // --- Branche PARTICULIER ---
  {
    name: 'situationPro',
    component: 'select',
    label: 'Situation professionnelle',
    visibleWhen: { field: 'typeClient', op: 'eq', value: 'particulier' },
    requiredWhen: { field: 'typeClient', op: 'eq', value: 'particulier' },
    options: [
      { value: 'salarie', label: 'Salarié' },
      { value: 'independant', label: 'Indépendant' },
      { value: 'retraite', label: 'Retraité' },
    ],
  },
  {
    // Condition composée : particulier ET salarié
    name: 'nomEmployeur',
    component: 'text',
    label: 'Nom de l’employeur',
    visibleWhen: {
      and: [
        { field: 'typeClient', op: 'eq', value: 'particulier' },
        { field: 'situationPro', op: 'eq', value: 'salarie' },
      ],
    },
    requiredWhen: { field: 'situationPro', op: 'eq', value: 'salarie' },
    validators: [{ type: 'minLength', value: 2, message: 'Nom trop court' }],
  },
  {
    name: 'revenuMensuel',
    component: 'number',
    label: 'Revenu mensuel net (€)',
    visibleWhen: { field: 'situationPro', op: 'in', value: ['salarie', 'independant'] },
    requiredWhen: { field: 'situationPro', op: 'in', value: ['salarie', 'independant'] },
    validators: [{ type: 'min', value: 1, message: 'Le revenu doit être supérieur à 0' }],
  },

  // --- Sous-cascade : co-emprunteur ---
  {
    name: 'coEmprunteur',
    component: 'checkbox',
    label: 'Avec un co-emprunteur',
    visibleWhen: { field: 'typeClient', op: 'eq', value: 'particulier' },
  },
  {
    name: 'revenuCoEmprunteur',
    component: 'number',
    label: 'Revenu mensuel du co-emprunteur (€)',
    visibleWhen: { field: 'coEmprunteur', op: 'truthy' },
    requiredWhen: { field: 'coEmprunteur', op: 'truthy' },
    validators: [
      {
        // Validation métier cross-champs : accès à toutes les valeurs du form
        type: 'custom',
        message: 'Le revenu du co-emprunteur ne peut pas dépasser 10x le revenu principal',
        validate: (value, all) => {
          const principal = Number(all.revenuMensuel ?? 0);
          if (!principal) return true;
          return Number(value) <= principal * 10;
        },
      },
    ],
  },
];

/* =========================================================================
   8. UTILISATION
   ========================================================================= */

export default function App() {
  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Demande de financement</h1>
      <DynamicForm
        schema={demandeFinancementSchema}
        onSubmit={(values) => {
          // Grâce à shouldUnregister, values ne contient QUE les champs visibles
          console.log('Valeurs soumises :', values);
        }}
      />
    </div>
  );
}

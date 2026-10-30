'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  TextField,
  Input,
  TextArea,
  Label,
  FieldError,
  Description,
  Button,
  Alert,
  Spinner,
  toast,
} from '@heroui/react';
import { churchSchema, type ChurchFormData } from '../schemas/church-schema';
import { createChurchAction, editChurchAction } from '../actions/church-actions';
import { slugify } from '../utils/slugify';
import type { Church } from '../types';

type FormMode = 'REGISTER' | 'EDIT';

interface ChurchFormProps {
  onSuccess?: (church: Church) => void;
  initialValues?: Church;
  mode: FormMode;
}

export function ChurchForm({ onSuccess, initialValues, mode }: ChurchFormProps) {
  const [successChurch, setSuccessChurch] = useState<Church | null>(null);
  const [isCustomSlug, setIsCustomSlug] = useState(mode === 'EDIT');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const isEditMode = mode === 'EDIT';

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          slug: initialValues.slug,
          neighborhood: initialValues.neighborhood,
          address: initialValues.address,
          latitude: String(initialValues.latitude),
          longitude: String(initialValues.longitude),
          instagram: initialValues.instagram ?? '',
        }
      : {
          name: '',
          slug: '',
          neighborhood: '',
          address: '',
          latitude: '',
          longitude: '',
          instagram: '',
        },
    mode: 'onTouched',
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue('name', newName, { shouldValidate: true });

    if (!isCustomSlug) {
      const autoSlug = slugify(newName);
      setValue('slug', autoSlug, { shouldValidate: newName.length >= 3 });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      const msg = 'Geolocalização não é suportada pelo seu navegador.';
      setGeoNotice(msg);
      toast.warning('Recurso indisponível', { description: msg, timeout: 4000 });
      return;
    }

    setGeoLoading(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        setValue('latitude', lat, { shouldValidate: true });
        setValue('longitude', lng, { shouldValidate: true });
        setGeoNotice('Coordenadas atuais capturadas com sucesso!');
        setGeoLoading(false);

        toast.info('Localização obtida', {
          description: `Coordenadas GPS preenchidas: ${lat}, ${lng}`,
          timeout: 3000,
        });
      },
      (err) => {
        const errorMsg = `Não foi possível obter a localização: ${err.message}`;
        setGeoNotice(errorMsg);
        setGeoLoading(false);

        toast.warning('Falha na geolocalização', {
          description: errorMsg,
          timeout: 4000,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (data: ChurchFormData) => {
    clearErrors('root');
    setGeoNotice(null);

    try {
      // Dispara a action correspondente ao modo
      const response =
        isEditMode && initialValues?.id
          ? await editChurchAction(initialValues.id, data)
          : await createChurchAction(data);

      if (!response.success) {
        if (response.errors) {
          Object.entries(response.errors).forEach(([field, messages]) => {
            setError(field as keyof ChurchFormData, {
              type: 'server',
              message: messages[0],
            });
          });
        }

        setError('root', {
          type: 'server',
          message:
            response.message ||
            (isEditMode ? 'Erro ao atualizar paróquia.' : 'Erro ao cadastrar paróquia.'),
        });

        toast.danger(isEditMode ? 'Falha ao atualizar' : 'Falha ao cadastrar', {
          description: response.message || 'Verifique os dados informados no formulário.',
          timeout: 5000,
        });
        return;
      }

      if (response.data) {
        setSuccessChurch(response.data);
        onSuccess?.(response.data);

        toast.success(isEditMode ? 'Paróquia atualizada!' : 'Paróquia cadastrada!', {
          description: `A paróquia "${response.data.name}" foi ${
            isEditMode ? 'atualizada' : 'registrada'
          } com sucesso.`,
          timeout: 5000,
        });
      }
    } catch (err) {
      console.error(err);
      const networkError = 'Falha de conexão com o servidor. Tente novamente mais tarde.';

      setError('root', {
        type: 'network',
        message: networkError,
      });

      toast.danger('Erro de conexão', {
        description: networkError,
        timeout: 5000,
      });
    }
  };

  const handleCreateAnother = () => {
    reset();
    setIsCustomSlug(false);
    setSuccessChurch(null);
    setGeoNotice(null);
  };

  if (successChurch) {
    return (
      <Card className="w-full max-w-3xl mx-auto border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20 text-zinc-900 dark:text-zinc-100 shadow-sm p-6 sm:p-8 rounded-xl">
        <div className="space-y-6">
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-200">
                {isEditMode
                  ? 'Paróquia atualizada com sucesso!'
                  : 'Paróquia cadastrada com sucesso!'}
              </Alert.Title>
              <Alert.Description className="text-sm mt-1 text-emerald-800 dark:text-emerald-300">
                A paróquia <strong>{successChurch.name}</strong> foi{' '}
                {isEditMode ? 'atualizada' : 'registrada'} no sistema.
              </Alert.Description>
            </Alert.Content>
          </Alert>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors w-full sm:w-auto"
            >
              Ver Todas as Paróquias
            </Link>
            {!isEditMode && (
              <Button
                variant="secondary"
                onPress={handleCreateAnother}
                className="w-full sm:w-auto"
              >
                Cadastrar Outra Paróquia
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
      <Card.Header className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <Card.Title className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {isEditMode ? 'Editar Paróquia' : 'Dados da Paróquia'}
        </Card.Title>
        <Card.Description className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          {isEditMode
            ? 'Altere as informações necessárias e salve as modificações.'
            : 'Preencha as informações para registrar a igreja e disponibilizar sua localização no mapa.'}
        </Card.Description>
      </Card.Header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card.Content className="p-6 space-y-6">
          {errors.root?.message && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title className="font-semibold text-red-900 dark:text-red-200">
                  Erro ao salvar
                </Alert.Title>
                <Alert.Description className="text-red-800 dark:text-red-300">
                  {errors.root.message}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              1. Identificação Geral
            </h3>

            <TextField isRequired isInvalid={!!errors.name} className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Nome da Paróquia *
              </Label>
              <Input
                id="name"
                placeholder="Ex: Paróquia Santo Antônio de Lisboa"
                {...register('name')}
                onChange={handleNameChange}
                disabled={isSubmitting}
                className="w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              {errors.name ? (
                <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.name.message}
                </FieldError>
              ) : (
                <Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Nome oficial ou popular como a igreja é conhecida na comunidade.
                </Description>
              )}
            </TextField>

            <TextField isRequired isInvalid={!!errors.slug} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Slug da URL *
                </Label>
                <button
                  type="button"
                  onClick={() => setIsCustomSlug((prev) => !prev)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {isCustomSlug ? 'Gerar automaticamente' : 'Personalizar manualmente'}
                </button>
              </div>
              <Input
                id="slug"
                placeholder="ex: paroquia-santo-antonio-de-lisboa"
                {...register('slug')}
                onChange={(e) => {
                  setIsCustomSlug(true);
                  setValue('slug', e.target.value, { shouldValidate: true });
                }}
                disabled={isSubmitting}
                className="w-full font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              {errors.slug && (
                <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.slug.message}
                </FieldError>
              )}
            </TextField>

            <TextField isInvalid={!!errors.instagram} className="space-y-1.5">
              <Label htmlFor="instagram" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Instagram da Paróquia
              </Label>
              <Input
                id="instagram"
                placeholder="Ex: @paroquiasantoantoniojp ou link"
                {...register('instagram')}
                disabled={isSubmitting}
                className="w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              {errors.instagram && (
                <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.instagram.message}
                </FieldError>
              )}
            </TextField>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              2. Localização & Endereço
            </h3>

            <TextField isRequired isInvalid={!!errors.neighborhood} className="space-y-1.5">
              <Label htmlFor="neighborhood" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Bairro *
              </Label>
              <Input
                id="neighborhood"
                placeholder="Ex: Tambaú, Manaíra, Cabo Branco, Centro..."
                {...register('neighborhood')}
                disabled={isSubmitting}
                className="w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              {errors.neighborhood && (
                <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.neighborhood.message}
                </FieldError>
              )}
            </TextField>

            <TextField isRequired isInvalid={!!errors.address} className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Endereço Completo *
              </Label>
              <TextArea
                id="address"
                placeholder="Ex: Av. Presidente Epitácio Pessoa, 1234 - próximo à praia"
                rows={3}
                {...register('address')}
                disabled={isSubmitting}
                className="w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              {errors.address && (
                <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.address.message}
                </FieldError>
              )}
            </TextField>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                3. Coordenadas no Mapa (GPS)
              </h3>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLoading || isSubmitting}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
              >
                {geoLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Obtendo localização...</span>
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    <span>Usar minha localização atual</span>
                  </>
                )}
              </button>
            </div>

            {geoNotice && (
              <div className="text-xs px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {geoNotice}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField isRequired isInvalid={!!errors.latitude} className="space-y-1.5">
                <Label htmlFor="latitude" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Latitude *
                </Label>
                <Input
                  id="latitude"
                  placeholder="Ex: -7.115320"
                  {...register('latitude')}
                  disabled={isSubmitting}
                  className="w-full font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
                />
                {errors.latitude && (
                  <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                    {errors.latitude.message}
                  </FieldError>
                )}
              </TextField>

              <TextField isRequired isInvalid={!!errors.longitude} className="space-y-1.5">
                <Label htmlFor="longitude" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Longitude *
                </Label>
                <Input
                  id="longitude"
                  placeholder="Ex: -34.861000"
                  {...register('longitude')}
                  disabled={isSubmitting}
                  className="w-full font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
                />
                {errors.longitude && (
                  <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                    {errors.longitude.message}
                  </FieldError>
                )}
              </TextField>
            </div>
          </div>
        </Card.Content>

        <Card.Footer className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onPress={() => {
              reset();
              setIsCustomSlug(isEditMode);
            }}
            isDisabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isEditMode ? 'Restaurar Valores' : 'Limpar'}
          </Button>

          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="w-full sm:w-auto font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>{isEditMode ? 'Salvando...' : 'Cadastrando...'}</span>
              </span>
            ) : isEditMode ? (
              'Salvar Alterações'
            ) : (
              'Cadastrar Paróquia'
            )}
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
}
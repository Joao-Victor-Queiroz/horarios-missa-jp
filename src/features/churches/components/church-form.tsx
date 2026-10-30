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
import { createChurchAction } from '../actions/church-actions';
import { slugify } from '../utils/slugify';
import type { Church } from '../types';

interface ChurchFormProps {
  onSuccess?: (church: Church) => void;
}

export function ChurchForm({ onSuccess }: ChurchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successChurch, setSuccessChurch] = useState<Church | null>(null);
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
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

  // Atualiza o slug automaticamente enquanto o usuário digita o nome
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue('name', newName, { shouldValidate: true });

    if (!isCustomSlug) {
      const autoSlug = slugify(newName);
      setValue('slug', autoSlug, { shouldValidate: newName.length >= 3 });
    }
  };

  // Captura localização geográfica do navegador
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
    setIsSubmitting(true);
    setServerError(null);
    setGeoNotice(null);

    try {
      const response = await createChurchAction(data);

      if (!response.success) {
        if (response.errors) {
          Object.entries(response.errors).forEach(([field, messages]) => {
            setError(field as keyof ChurchFormData, {
              type: 'server',
              message: messages[0],
            });
          });
        }
        setServerError(response.message);

        // Feedback via Toast de Erro
        toast.danger('Falha ao cadastrar', {
          description: response.message || 'Verifique os dados informados no formulário.',
          timeout: 5000,
        });
        return;
      }

      if (response.data) {
        setSuccessChurch(response.data);
        onSuccess?.(response.data);

        // Feedback via Toast de Sucesso
        toast.success('Paróquia cadastrada!', {
          description: `A paróquia "${response.data.name}" foi registrada com sucesso.`,
          timeout: 5000,
        });
      }
    } catch (err) {
      console.error(err);
      const networkError = 'Falha de conexão com o servidor. Tente novamente mais tarde.';
      setServerError(networkError);

      toast.danger('Erro de conexão', {
        description: networkError,
        timeout: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    reset({
      name: '',
      slug: '',
      neighborhood: '',
      address: '',
      latitude: '',
      longitude: '',
      instagram: '',
    });
    setIsCustomSlug(false);
    setSuccessChurch(null);
    setServerError(null);
    setGeoNotice(null);
  };

  // Tela de Sucesso
  if (successChurch) {
    return (
      <Card className="w-full max-w-3xl mx-auto border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20 text-zinc-900 dark:text-zinc-100 shadow-sm p-6 sm:p-8 rounded-xl transition-colors duration-200">
        <div className="space-y-6">
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-200">
                Paróquia cadastrada com sucesso!
              </Alert.Title>
              <Alert.Description className="text-sm mt-1 text-emerald-800 dark:text-emerald-300">
                A paróquia <strong>{successChurch.name}</strong> foi registrada no sistema.
              </Alert.Description>
            </Alert.Content>
          </Alert>

          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-3 text-sm shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider font-medium">Nome</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">{successChurch.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider font-medium">Slug (URL)</span>
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded font-mono border border-zinc-200 dark:border-zinc-700">
                  {successChurch.slug}
                </code>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider font-medium">Bairro</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{successChurch.neighborhood}</span>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider font-medium">Instagram</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {successChurch.instagram ? `@${successChurch.instagram}` : 'Não informado'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider font-medium">Endereço</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{successChurch.address}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider font-medium">Coordenadas (GPS)</span>
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  Latitude: {successChurch.latitude} | Longitude: {successChurch.longitude}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors w-full sm:w-auto"
            >
              Ver Todas as Paróquias
            </Link>
            <Button
              variant="secondary"
              onPress={handleCreateAnother}
              className="w-full sm:w-auto"
            >
              Cadastrar Outra Paróquia
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden transition-colors duration-200">
      <Card.Header className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <Card.Title className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dados da Paróquia
        </Card.Title>
        <Card.Description className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Preencha as informações para registrar a igreja e disponibilizar sua localização no mapa.
        </Card.Description>
      </Card.Header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card.Content className="p-6 space-y-6">
          {/* Alerta de erro do servidor */}
          {serverError && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title className="font-semibold text-red-900 dark:text-red-200">Erro ao salvar</Alert.Title>
                <Alert.Description className="text-red-800 dark:text-red-300">{serverError}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          {/* Seção 1: Identificação */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              1. Identificação Geral
            </h3>

            {/* Nome da Paróquia */}
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

            {/* Slug da Paróquia */}
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
              {errors.slug ? (
                <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.slug.message}
                </FieldError>
              ) : (
                <Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Identificador único na URL (letras minúsculas, números e hífens).
                </Description>
              )}
            </TextField>

            {/* Instagram */}
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
              {errors.instagram ? (
                <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.instagram.message}
                </FieldError>
              ) : (
                <Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Opcional. Perfil oficial no Instagram para divulgações.
                </Description>
              )}
            </TextField>
          </div>

          {/* Seção 2: Localização */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              2. Localização & Endereço
            </h3>

            {/* Bairro */}
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
              {errors.neighborhood ? (
                <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.neighborhood.message}
                </FieldError>
              ) : (
                <Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Bairro onde a igreja está situada em João Pessoa ou região metropolitana.
                </Description>
              )}
            </TextField>

            {/* Endereço Completo */}
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
              {errors.address ? (
                <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.address.message}
                </FieldError>
              ) : (
                <Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Logradouro, número, ponto de referência e CEP se houver.
                </Description>
              )}
            </TextField>
          </div>

          {/* Seção 3: Coordenadas Geográficas */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                3. Coordenadas no Mapa (GPS)
              </h3>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLoading || isSubmitting}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 transition-colors"
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
              {/* Latitude */}
              <TextField isRequired isInvalid={!!errors.latitude} className="space-y-1.5">
                <Label htmlFor="latitude" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Latitude *
                </Label>
                <Input
                  id="latitude"
                  placeholder="Ex: -7.115320"
                  {...register('latitude')}
                  disabled={isSubmitting}
                  className="w-full font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
                {errors.latitude ? (
                  <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                    {errors.latitude.message}
                  </FieldError>
                ) : (
                  <Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Exemplo para JP: entre -7.0 e -7.3
                  </Description>
                )}
              </TextField>

              {/* Longitude */}
              <TextField isRequired isInvalid={!!errors.longitude} className="space-y-1.5">
                <Label htmlFor="longitude" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Longitude *
                </Label>
                <Input
                  id="longitude"
                  placeholder="Ex: -34.861000"
                  {...register('longitude')}
                  disabled={isSubmitting}
                  className="w-full font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
                {errors.longitude ? (
                  <FieldError className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                    {errors.longitude.message}
                  </FieldError>
                ) : (
                  <Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Exemplo para JP: entre -34.7 e -35.0
                  </Description>
                )}
              </TextField>
            </div>
          </div>
        </Card.Content>

        {/* Rodapé de Ações */}
        <Card.Footer className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onPress={() => {
              reset();
              setIsCustomSlug(false);
              setServerError(null);
            }}
            isDisabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Limpar
          </Button>

          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="w-full sm:w-auto font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Cadastrando...</span>
              </span>
            ) : (
              'Cadastrar Paróquia'
            )}
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
}

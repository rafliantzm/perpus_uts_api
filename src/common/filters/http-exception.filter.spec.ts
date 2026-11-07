import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, ConflictException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter (RFC 9457 Problem Details & Legacy Envelope)', () => {
  const filter = new HttpExceptionFilter();

  const createMockHost = (acceptHeader = 'application/json', url = '/api/v1/test') => {
    const mockResponse: any = {
      statusCode: 200,
      headers: {},
      setHeader: vi.fn((key: string, val: string) => {
        mockResponse.headers[key] = val;
      }),
      status: vi.fn((code: number) => {
        mockResponse.statusCode = code;
        return mockResponse;
      }),
      json: vi.fn((payload: any) => payload),
    };

    const mockRequest: any = {
      headers: { accept: acceptHeader },
      url,
      originalUrl: url,
    };

    const mockHost: any = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    return { mockHost, mockResponse, mockRequest };
  };

  it('harus mengembalikan format Problem Details RFC 9457 saat klien mengirimkan Accept: application/problem+json pada error 400', () => {
    const { mockHost, mockResponse } = createMockHost('application/problem+json', '/api/v1/books');
    const exception = new BadRequestException(['totalCopies harus lebih dari 0', 'title tidak boleh kosong']);

    const result = filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
    expect(result).toHaveProperty('type', 'https://api.perpus.ac.id/errors/bad-request');
    expect(result).toHaveProperty('title', 'Bad Request');
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('detail');
    expect(result.detail).toContain('totalCopies harus lebih dari 0');
    expect(result).toHaveProperty('instance', '/api/v1/books');
  });

  it('harus mengembalikan format Problem Details RFC 9457 saat klien mengirimkan Accept: application/problem+json pada error 409', () => {
    const { mockHost, mockResponse } = createMockHost('application/problem+json', '/api/v1/members');
    const exception = new ConflictException('NIM 2210511001 sudah terdaftar');

    const result = filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
    expect(result).toHaveProperty('type', 'https://api.perpus.ac.id/errors/conflict');
    expect(result).toHaveProperty('title', 'Conflict');
    expect(result).toHaveProperty('status', 409);
    expect(result).toHaveProperty('detail', 'NIM 2210511001 sudah terdaftar');
    expect(result).toHaveProperty('instance', '/api/v1/members');
  });

  it('harus mempertahankan format envelope JSON legacy saat klien mengirimkan Accept: application/json', () => {
    const { mockHost, mockResponse } = createMockHost('application/json', '/api/v1/books');
    const exception = new BadRequestException('Judul buku wajib diisi');

    const result = filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(result).toHaveProperty('statusCode', 400);
    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('message', 'Judul buku wajib diisi');
    expect(result).toHaveProperty('error', 'Bad Request');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('path', '/api/v1/books');
  });
});
